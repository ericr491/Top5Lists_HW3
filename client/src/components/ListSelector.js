import React, { useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import ListCard from './ListCard.js'
import { GlobalStoreContext } from '../store'
import DeleteModal from './DeleteModal'
/*
    This React component lists all the top5 lists in the UI.
    
    @author McKilla Gorilla
*/
const ListSelector = () => {
    const { store } = useContext(GlobalStoreContext)
    store.history = useHistory()

    useEffect(() => {
        store.loadIdNamePairs()
    }, [])

    const createNewList = () => {
        store.createNewList({
            name: "Untitled" + store.newListCounter,
            items: [
                "?",
                "?",
                "?",
                "?",
                "?"
            ]
        })
    }

    let listCard = ""
    if (store) {
        listCard = store.idNamePairs.map((pair) => (
            <ListCard
                key={pair._id}
                idNamePair={pair}
                selected={store.currentList && store.currentList._id === pair._id}
            />
        ))
    }
    return (
        <div id="top5-list-selector">
            {store.isListNameEditActive ? (
                <div id="list-selector-heading">
                    <input
                        type="button"
                        id="add-list-button"
                        className="top5-button"
                        style={{ opacity: 0.35 }}
                        value="+" />
                    Your Lists
                </div>) :
                (<div id="list-selector-heading">
                    <input
                        type="button"
                        id="add-list-button"
                        className="top5-button"
                        onClick={createNewList}
                        value="+" />
                    Your Lists
                </div>)
            }
            <div id="list-selector-list">
                {
                    listCard
                }
                <DeleteModal />
            </div>
        </div>)
}

export default ListSelector