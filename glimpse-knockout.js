;(function($, pubsub, tab, render) {
    'use strict';
    pubsub.subscribe('action.panel.rendering.ko', function (args) {
        var models = [];
        var excludeTags = ['script', 'link'];
        var body = document.body;
        var child, model;

        for(var i = 0, il = body.children.length; i < il; i++) {
            child = body.children[i];
            if (~excludeTags.indexOf(child.tagName)) {
                continue;
            }

            model = ko.contextFor(child);
            if (model) {
                model = model.$root;
                var item = models.filter(function (m) {
                    return m.ko === model;
                })[0];

                if (!item) {
                    item = { ko: model, elements: [] };
                    models.push(item);
                }

                item.elements.push(child);
            }
        }
        args.pluginData.models = models;
    });

    pubsub.subscribe('action.panel.showed.ko', function (args) {
        var models = args.pluginData.models;

        if (!models.length) {
            render.engine.insert(args.panel, 'No ko ViewModel\'s were found');
        } else {
            var rowData = models.map(function (record) {
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
            });

            var viewData = [ ['Elements', 'ViewModel'] ];
            for (var i = 0; i < rowData.length; i++) {
                var rowDataItem = rowData[i];
                    elementsData = [ [ 'Tag Name', 'Class', 'Id' ] ];

                for (var x = 0; x < rowDataItem.elementNames.length; x++) {
                    elementsData.push(rowDataItem.elementNames[x]);
                }

                var keys = Object.getOwnPropertyNames(rowDataItem.data);
                var data = {};
                keys.forEach(function (key) {
                    var item = rowDataItem.data[key];
                    data[key] = ko.isObservable(item) ? ko.utils.unwrapObservable(item) : item;
                });

                viewData.push([ elementsData, data ])
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
                                that.html(val);
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
            isPermanent: true,
            data: 'Loading...',
            models: []
        }
    };

    tab.register(config);
})(jQueryGlimpse, glimpse.pubsub, glimpse.tab, glimpse.render);