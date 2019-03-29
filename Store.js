/*!
 * Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import uuid from 'uuid-random';

class Store {
  constructor({dataHub}) {
    this.dataHub = dataHub;
  }

  async get(did) {
    const [doc] = await this.dataHub.find({equals: {id: did}});
    return doc;
  }

  async put(did, doc) {
    return this.dataHub.insert({
      doc: {
        id: uuid(),
        content: doc.doc
      }
    });
  }
}

export default Store;
