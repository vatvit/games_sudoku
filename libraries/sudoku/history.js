"use strict";

let ModelSudokuHistory = require('./../../models/sudoku/history'),
    array = require('./../../helpers/array');

class History {

    constructor (model) {
        this.model = model;
        this.undo = {};
        this.redo = {};

        this.init();
    }

    /********************************************** INIT ***/

    init () {
        // TODO: load data from mongo and set undo/redo
    };

    /********************************************** /INIT ***/

    /********************************************** PUBLIC METHODS ***/

    getId () {
        return this.model.id;
    }

    getDiff (fromCells, toCells) {
        let diff = {
                checkedCells: {},
                markedCells: {}
            },
            cellKeys = [];

        cellKeys = Object.keys(fromCells).concat(Object.keys(toCells));
        cellKeys = array.unique(cellKeys);
        cellKeys.forEach(function (key) {
            if (fromCells.hasOwnProperty(key) && !toCells.hasOwnProperty(key)) {
                diff.checkedCells[key] = 0;
                diff.markedCells[key] = [];
            } else if (!fromCells.hasOwnProperty(key) && toCells.hasOwnProperty(key)) {
                if (+toCells[key].number) {
                    diff.checkedCells[key] = +toCells[key].number;
                }
                if (toCells[key].marks.length) {
                    diff.markedCells[key] = toCells[key].marks;
                }
            } else {
                if (+fromCells[key].number !== +toCells[key].number) {
                    diff.checkedCells[key] = +toCells[key].number;
                }
                if (array.isDifferent(fromCells[key].marks, toCells[key].marks)) {
                    diff.markedCells[key] = toCells[key].marks;
                }
            }
        });
        return diff;
    }

    addAction (actionData, callback) {
        this.undo = actionData;
        this.redo = {};
        this._save(callback);
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** PROTECTED METHODS ***/

    _save (callback) {
        this.model.save(function (error) {
            if (error) { return callback(error); }
            callback(null);
        });
    }

    /********************************************** /PROTECTED METHODS ***/

    /********************************************** STATIC METHODS ***/

    static create (callback) {
        var model = new ModelSudokuHistory();
        model.save(function (error) {
            if (error) { return callback(error); }

            callback(null, new History(model));
        });
    }

    static load (id, callback) {
        ModelSudokuHistory.findById(id, function (error, model) {
            if (error) { return callback(error); }
            if (!model) { return callback(new Error('Wrong history ID')); }

            callback(null, new History(model));
        });
    }

    /********************************************** /STATIC METHODS ***/

}

module.exports = History;
