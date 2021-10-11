import jsTPS_Transaction from '../common/jsTPS'

/**
 * ChangeItem_Transaction
 * 
 * This class represents a transaction that updates the text
 * for a given item. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class ChangeItem_Transaction extends jsTPS_Transaction {
    constructor (initStore, initIndex, initOldText, initNewText) {
        super()
        this.store = initStore
        this.index = initIndex
        this.oldText = initOldText
        this.newText = initNewText
    }

    doTransaction() {
        this.store.changeListItemName(this.newText, this.index)
    }

    undoTransaction() {
        this.store.changeListItemName(this.oldText, this.index)
    }
}