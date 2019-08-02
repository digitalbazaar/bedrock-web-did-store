/*!
 * Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// import uuid from 'uuid-random';

export class DidStore {
  constructor({hub, invocationSigner}) {
    this.hub = hub;
    this.invocationSigner = invocationSigner;
  }

  async get({id}) {
    const {invocationSigner} = this;
    const {content: doc, meta} = await this.hub.get({id, invocationSigner});
    return {doc, meta};
  }

  async put({doc, meta}) {
    // get public representation of DID
    const hubDoc = {
      content: {...doc},
      meta: {...meta}
    };
    const {invocationSigner} = this;
    return this.hub.insert({doc: hubDoc, invocationSigner});
  }
}
