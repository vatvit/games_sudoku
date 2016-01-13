"use strict";

let Module = require('./../../helpers/module').dir(__dirname);

let HistoryStorageMemory = Module('./history/storage/memory');

let ModelSudokuHistoryAction = require('./../../models/sudoku/history/action'),
    HistoryStorageMongoose = require('./history/storage/mongoose'),
    //HistoryStorageMemory = require('./history/storage/memory'),
    HistoryAction = require('./history/action'),
    Array = require('./../../helpers/array');

class History {

    constructor (storage) {
        this.storage = storage;

        this.init();
    }

    /********************************************** INIT ***/

    init () {
        // nothing
    };

    /********************************************** /INIT ***/

    /********************************************** PUBLIC METHODS ***/

    getId () {
        return this.storage.getId();
    }

    getDiff (fromCells, toCells) {
        let diff = {
                checkedCells: {},
                markedCells: {}
            },
            cellKeys = [];

        cellKeys = Object.keys(fromCells).concat(Object.keys(toCells));
        cellKeys = Array.unique(cellKeys);
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
                if (Array.isDifferent(fromCells[key].marks, toCells[key].marks)) {
                    diff.markedCells[key] = toCells[key].marks;
                }
            }
        });
        return diff;
    }

    actionSetCells (oldParameters, newParameters, callback) {
        let action = new HistoryAction(History.ACTION_TYPE_SET_CELLS, {
            oldParameters: oldParameters,
            newParameters: newParameters
        });
        this.storage.saveAction(action, callback);
    }

    actionClearBoard (oldParameters, newParameters, callback) {

    }

    actionDoUndo (oldParameters, callback) {

    }

    actionDoRedo (oldParameters, callback) {

    }

    /**
     * @deprecated
     *
     * @param actionType
     * @param actionData
     * @param callback
     */
    addAction (actionType, actionData, callback) {
        this.storage.saveAction(actionType, actionData, callback);
    }

    getUndo () {
        return this.storage.getUndoAction().oldParameters || {};
    }

    getRedo () {
        return this.storage.getRedoAction().oldParameters || {};
    }

    /********************************************** /PUBLIC METHODS ***/

    /********************************************** STATIC METHODS ***/

    static create (gameHash, callback) {
        //let storage = new HistoryStorageMongoose(gameHash, ModelSudokuHistoryAction);
        let storage = new (HistoryStorageMemory())(gameHash);

        storage.init(function (error) {
            if (error) return callback(error);
            callback(null, new History(storage));
        });
    }

    static load (gameHash, callback) {
        //let storage = new HistoryStorageMongoose(gameHash, ModelSudokuHistoryAction);
        let storage = new (HistoryStorageMemory())(gameHash);

        storage.init(function (error) {
            if (error) return callback(error);
            callback(null, new History(storage));
        });
    }

    static getAllowedActionTypes () {
        return [
            History.ACTION_TYPE_SET_CELLS,
            History.ACTION_TYPE_CLEAR_BOARD,
            History.ACTION_TYPE_UNDO,
            History.ACTION_TYPE_REDO
        ];
    }

    /********************************************** /STATIC METHODS ***/

}

History.ACTION_TYPE_SET_CELLS = 'setCells';
History.ACTION_TYPE_CLEAR_BOARD = 'clearBoard';
History.ACTION_TYPE_UNDO = 'undo';
History.ACTION_TYPE_REDO = 'redo';

module.exports = History;
