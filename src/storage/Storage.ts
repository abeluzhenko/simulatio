export type ItemId = number

export class Storage<Item = unknown> implements Iterable<Item> {
  private data = new Map<ItemId, Item>()

  createId(seed: number): ItemId {
    return seed
  }

  add(id: ItemId, item: Item) {
    this.data.set(id, item)
  }

  get(id: ItemId) {
    return this.data.get(id)
  }

  delete(id: ItemId) {
    this.data.delete(id)
  }

  [Symbol.iterator]() {
    return this.data.values()
  }
}
