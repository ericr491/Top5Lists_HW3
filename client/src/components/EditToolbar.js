import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext)
    const history = useHistory()

    let enabledButtonClass = "top5-button"
    function handleUndo() {
        store.undo()
    }
    function handleRedo() {
        store.redo()
    }
    function handleClose() {
        history.push("/")
        store.closeCurrentList()
    }
    let editStatus = false
    if (store.isListNameEditActive) {
        editStatus = true
    }

    let faded = {
        opacity: 0.35,
        cursor: 'default',
    }

    if (!store.currentList || store.isItemEditActive) {
        return (
            <div id="edit-toolbar">
                <div
                    disabled={editStatus}
                    id='undo-button'
                    className={enabledButtonClass}
                    style={faded}>
                    &#x21B6;
                </div>
                <div
                    disabled={editStatus}
                    id='redo-button'
                    className={enabledButtonClass}
                    style={faded}>
                    &#x21B7;
                </div>
                <div
                    disabled={editStatus}
                    id='close-button'
                    className={enabledButtonClass}
                    style={faded}>
                    &#x24E7;
                </div>
            </div>
        )
    } else {
        return (
            <div id="edit-toolbar">
                {store.hasUndo() ? (<div
                    disabled={false}
                    id='undo-button'
                    onClick={handleUndo}
                    className={enabledButtonClass}>
                    &#x21B6;
                </div>) :
                    (<div
                        disabled={true}
                        id='undo-button'
                        style={faded}
                        className={enabledButtonClass}>
                        &#x21B6;
                    </div>)}
                {store.hasRedo() ? (<div
                    disabled={false}
                    id='redo-button'
                    onClick={handleRedo}
                    className={enabledButtonClass}>
                    &#x21B7;
                </div>) :
                    (<div
                        disabled={true}
                        id='redo-button'
                        style={faded}
                        className={enabledButtonClass}>
                        &#x21B7;
                    </div>)
                }
                <div
                    disabled={editStatus}
                    id='close-button'
                    onClick={handleClose}
                    className={enabledButtonClass}>
                    &#x24E7;
                </div>
            </div>
        )
    }
}

export default EditToolbar