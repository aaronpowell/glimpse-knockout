;(function($, pubsub, tab, render, ko) {
    'use strict';

    if (!ko) {
        pubsub.subscribe('action.panel.showed.ko', function (args) {
            render.engine.insert(args.panel, 'KnockoutJS is not available on this screen. Plugin disabled.');
        });
        return;
    }

    var models = ko.observableArray();
    pubsub.subscribe('action.panel.rendering.ko', function (args) {
        var excludeTags = ['script', 'link'];
        var body = document.body;

        var elementWalker = function (child) {
            var model;
            if (~excludeTags.indexOf(child.tagName)) {
                return;
            }

            model = ko.contextFor(child);
            if (model) {
                model = model.$root;
                var item = models().filter(function (m) {
                    return m.ko === model;
                })[0];

                if (!item) {
                    item = { ko: model, elements: [] };
                    models.push(item);
                }

                item.elements.push(child);
            } else {
                for (var i = 0, il = child.children.length; i < il; i++) {
                    elementWalker(child.children[i]);
                }
            }
        };

        for(var i = 0, il = body.children.length; i < il; i++) {
            elementWalker(body.children[i]);
        }
    });

    pubsub.subscribe('action.panel.showed.ko', function (args) {
        var modelToRow = function (record) {
            var model = record.ko;
            var elementNames = record.elements.map(function (element) {
                return [
                    element.tagName.toLowerCase(),
                    element.className || '-',
                    element.id || '-'
                ];
            });

            return {
                elementNames: elementNames,
                data: model
            };
        };

        var rowToView = function (rowDataItem) {
            var elementsData = [ [ 'Tag Name', 'Class', 'Id' ] ];

            for (var x = 0; x < rowDataItem.elementNames.length; x++) {
                elementsData.push(rowDataItem.elementNames[x]);
            }

            var keys = Object.getOwnPropertyNames(rowDataItem.data);
            var data = {};
            keys.forEach(function (key) {
                var item = rowDataItem.data[key];
                data[key] = ko.isObservable(item) ? ko.utils.unwrapObservable(item) : item;
            });

            return [ elementsData, data ];
        };

        models.subscribe(function (value) {
            var rowData = [modelToRow(value[value.length - 1])];

            var viewData = [ ['Elements', 'ViewModel'] ];
            for (var i = 0; i < rowData.length; i++) {
                viewData.push(rowToView(rowData[i]))
            }

            render.engine.insert(args.panel, viewData);

            //temp work arounds until there is a better way to interact with generated HTML
            var viewModelTables = args.panel.children('table').last();

            viewModelTables.each(function () {
                var table = $(this);
                var vmCells = table.children('.glimpse-row-holder').find('> tr > td:last-child');

                vmCells.each(function (i) {
                    var vmCell = $(this);
                    var rows = vmCell.find('tbody tr');

                    rows.each(function (j) {
                        var that = $(this).find('td');
                        var item = rowData[i].data[Object.getOwnPropertyNames(rowData[i].data)[j]];
                        if (ko.isObservable(item)) {
                            item.subscribe(function (val) {
                                that.html(null);
                                render.engine.insert(that, val);
                            });
                        }
                    });
                });
            });
        });

        if (!models().length) {
            render.engine.insert(args.panel, 'No ko ViewModel\'s were found');
        } else {
            var rowData = models().map(modelToRow);

            var viewData = [ ['Elements', 'ViewModel'] ];
            for (var i = 0; i < rowData.length; i++) {
                viewData.push(rowToView(rowData[i]))
            }

            render.engine.insert(args.panel, viewData);

            //temp work arounds until there is a better way to interact with generated HTML
            var viewModelTables = args.panel.children('table');

            viewModelTables.each(function () {
                var table = $(this);
                var vmCells = table.children('.glimpse-row-holder').find('> tr > td:last-child');

                vmCells.each(function (i) {
                    var vmCell = $(this);
                    var rows = vmCell.find('tbody tr');

                    rows.each(function (j) {
                        var that = $(this).find('td');
                        var item = rowData[i].data[Object.getOwnPropertyNames(rowData[i].data)[j]];
                        if (ko.isObservable(item)) {
                            item.subscribe(function (val) {
                                that.html(null);
                                render.engine.insert(that, val);
                            });
                        }
                    });
                });
            });
        }
    });

    var config = {
        key: 'ko',
        payload: {
            name: 'KnockoutJS',
            version: '0.1.0',
            isPermanent: true,
            data: 'Loading...'
        }
    };

    tab.register(config);

    var originalApplyBindings = ko.applyBindings;
    ko.applyBindings = function () {
        models.push({
            ko: arguments[0],
            elements: [arguments[1] || document.body]
        });
        originalApplyBindings.apply(this, arguments);
    };

window.models = models;
})(jQueryGlimpse, glimpse.pubsub, glimpse.tab, glimpse.render, window.ko);