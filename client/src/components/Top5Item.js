import { React, useContext, useState } from "react"
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext)
    const [draggedTo, setDraggedTo] = useState(0)
    const [editActive, setEditActive] = useState(false)
    const [text, setText] = useState(props.text)
    const [oldText, setOldText] = useState(props.text)


    function handleDragStart(event) {
        event.dataTransfer.setData("item", event.target.id)
    }

    function handleDragOver(event) {
        event.preventDefault()
    }

    function handleDragEnter(event) {
        event.preventDefault()
        setDraggedTo(true)
    }

    function handleDragLeave(event) {
        event.preventDefault()
        setDraggedTo(false)
    }

    function handleDrop(event) {
        event.preventDefault()
        let target = event.target
        let targetId = target.id
        targetId = targetId.substring(target.id.indexOf("-") + 1)
        let sourceId = event.dataTransfer.getData("item")
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1)
        setDraggedTo(false)

        // UPDATE THE LIST
        if (sourceId !== targetId) {
            store.addMoveItemTransaction(sourceId, targetId)
        }
    }

    let { index } = props
    let itemClass = "top5-item"
    if (draggedTo) {
        itemClass = "top5-item-dragged-to"
    }

    const handleEditClick = (event) => {
        event.preventDefault()
        toggleEdit()
    }

    const toggleEdit = () => {
        let newActive = !editActive
        store.toggleListItemEdit(newActive)
        setEditActive(newActive)
    }

    const handleEditKeyPress = (event) => {
        if (event.code === "Enter") {
            if (oldText !== text) {
                store.addChangeItemTransaction(oldText, text, index)
                setOldText(text)
            }
            toggleEdit()
        }
    }

    const handleUpdate = (event) => {
        setText(event.target.value)
    }

    const handleOnBlur = (event) => {
        event.preventDefault()
        toggleEdit()
    }

    if (editActive) {
        return (
            <input
                autoFocus={true}
                id={"edit-item-" + index + 1}
                type='text'
                className={itemClass}
                onKeyPress={handleEditKeyPress}
                onChange={handleUpdate}
                defaultValue={props.text || ""}
                onBlur={handleOnBlur}
            />
        )
    } else if (store.isItemEditActive) {
        return (
            <div
                id={'item-' + (index + 1)}
                className={itemClass}
                draggable={false}
            >
                <input
                    type="button"
                    id={"edit-item-" + index + 1}
                    className="list-card-button"
                    value={"\u270E"}
                    disabled={true}
                    style={{ opacity: 0.35 }}
                />
                {props.text}
            </div>)
    } else {
        return (
            <div
                id={'item-' + (index + 1)}
                className={itemClass}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                draggable={true}
            >
                <input
                    type="button"
                    id={"edit-item-" + index + 1}
                    className="list-card-button"
                    value={"\u270E"}
                    onClick={handleEditClick}
                />
                {props.text}
            </div>)
    }
}

export default Top5Item