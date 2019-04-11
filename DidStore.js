/*!
 * Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// import uuid from 'uuid-random';

export class DidStore {
  constructor({hub}) {
    this.hub = hub;
  }

  async get({id}) {
    const {content: {doc, meta}} = await this.hub.get({id});
    return {doc, meta};
  }

  async insert({doc, meta}) {
    // get public representation of DID
    const hubDoc = {
      id: doc.id,
      content: {
        doc,
        // meta === {sequence: 0}
        meta,
      }
    };

    return this.hub.insert({doc: hubDoc});
  }
}
