import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import ChangeItem_Transaction from '../transactions/ChangeItem_Transaction'
export const GlobalStoreContext = createContext({})
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    MARK_LIST_IN_EDIT_MODE: "MARK_LIST_IN_EDIT_MODE",
    NO_LONGER_EDIT: "NO_LONGER_EDIT",
    LIST_ITEM_EDIT_CHANGE: "LIST_ITEM_EDIT_CHANGE",
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS()

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null, // ONLY FOR THE EXPANDED VIEW
        newListCounter: 0, // NAMING PURPOSES 
        isListNameEditActive: false, // IF USER IS EDITING LIST NAME, DISABLE UI
        isItemEditActive: false, // IF USER IS EDITING LIST ITEMS NAMES, DISABLE UI
        listMarkedForDeletion: null, // DELETING
        listIdBeingEdited: undefined,
    })

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listIdBeingEdited: undefined,
                })
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listIdBeingEdited: undefined,
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listIdBeingEdited: undefined,
                })
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listIdBeingEdited: undefined,
                })
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // CREATE A NEW LIST + MARK IT FOR EDIT
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs.concat(payload.idNamePairs),
                    currentList: null,
                    newListCounter: store.newListCounter + 1,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listIdBeingEdited: payload.idNamePairs._id,
                })
            }

            case GlobalStoreActionType.NO_LONGER_EDIT: {
                return setStore({
                    ...store,
                    listIdBeingEdited: undefined,
                })
            }

            case GlobalStoreActionType.LIST_ITEM_EDIT_CHANGE: {
                return setStore({
                    ...store,
                    isItemEditActive: payload,
                })
            }
            default:
                return store
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.


    // THIS FUNCTION CREATES A NEW LIST
    // {
    //     "name": "Games",
    //     "items": [
    //         "StarCraft",
    //         "Fallout 3",
    //         "Katamari Damacy",
    //         "Civilization II",
    //         "Super Mario World"
    //     ]
    // }
    store.createNewList = (list) => {
        async function asyncCreateNewList(list) {
            let response = await api.createTop5List(list)
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.CREATE_NEW_LIST,
                    payload: {
                        idNamePairs: {
                            _id: response.data.top5List._id,
                            name: response.data.top5List.name,
                        },
                        top5List: response.data.top5List,
                    }
                })
            }
        }
        asyncCreateNewList(list)
    }

    store.toggleListItemEdit = (boolean) => {
        storeReducer({
            type: GlobalStoreActionType.LIST_ITEM_EDIT_CHANGE,
            payload: boolean
        })
    }

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id)
            if (response.data.success) {
                let top5List = response.data.top5List
                top5List.name = newName
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List)
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs()
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                })
                            }
                        }
                        getListPairs(top5List)
                    }
                }
                updateList(top5List)
            }
        }
        asyncChangeListName(id)
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        })
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getTop5ListPairs()
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                })
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS")
            }
        }
        asyncLoadIdNamePairs()
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo

    // THIS LOADS THE FULL LIST VIEW
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id)
            if (response.data.success) {
                let top5List = response.data.top5List

                response = await api.updateTop5ListById(top5List._id, top5List)
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    })
                    store.history.push("/top5list/" + top5List._id)
                }
            }
        }
        asyncSetCurrentList(id)
    }
    store.addChangeItemTransaction = function (oldText, newText, index) {
        let transaction = new ChangeItem_Transaction(store, index, oldText, newText)
        tps.addTransaction(transaction)
    }
    store.changeListItemName = function (newName, position) {
        store.currentList.items[position] = newName
        store.updateCurrentList()
    }
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end)
        tps.addTransaction(transaction)
    }
    store.moveItem = function (start, end) {
        start -= 1
        end -= 1
        if (start < end) {
            let temp = store.currentList.items[start]
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1]
            }
            store.currentList.items[end] = temp
        }
        else if (start > end) {
            let temp = store.currentList.items[start]
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1]
            }
            store.currentList.items[end] = temp
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList()
    }
    store.updateCurrentList = function () {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList)
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                })
            }
        }
        asyncUpdateCurrentList()
    }
    store.undo = function () {
        tps.undoTransaction()
    }
    store.redo = function () {
        tps.doTransaction()
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        })
    }

    store.noLongerEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.NO_LONGER_EDIT,
            payload: null
        })
    }

    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer }
}