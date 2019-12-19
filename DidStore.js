/*!
 * Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

export class DidStore {
  constructor({edv, invocationSigner}) {
    this.edv = edv;
    this.invocationSigner = invocationSigner;
  }

  async get({id}) {
    const {invocationSigner} = this;
    const {content: doc, meta} = await this.edv.get({id, invocationSigner});
    return {doc, meta};
  }

  async put({doc, meta}) {
    // get public representation of DID
    const devDoc = {
      content: {...doc},
      meta: {...meta}
    };
    const {invocationSigner} = this;
    return this.edv.insert({doc: devDoc, invocationSigner});
  }
}
