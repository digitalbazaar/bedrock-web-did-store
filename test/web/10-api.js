/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {DidStore} from 'bedrock-web-did-store';

import {AccountMasterKey, KmsService} from 'bedrock-web-kms';
import {DataHub, DataHubService} from 'bedrock-web-data-hub';

import {VeresOne} from 'did-veres-one';
const v1 = new VeresOne();

let didStore;
let kmsApi;

describe('describe', () => {

  // setup didStore
  before(async () => {
    const kmsPlugin = 'ssm-v1';
    const kmsService = new KmsService();

    // this corresponds to the account setup in setup-accounts.js
    const accountId = 'urn:uuid:e534fa02-b136-4ff1-943d-4f88458f6324';

    kmsApi = await AccountMasterKey.fromSecret({
      accountId,
      kmsPlugin,
      kmsService,
      secret: 'woohoo',
    });

    // Use the Master Key to create KEK and HMAC keys
    const kek = await kmsApi.generateKey({type: 'kek'});
    const hmac = await kmsApi.generateKey({type: 'hmac'});

    const config = {
      sequence: 0,
      controller: accountId,
      primary: true,
      kek: {id: kek.id, algorithm: kek.algorithm},
      hmac: {id: hmac.id, algorithm: hmac.algorithm}
    };

    const dhs = new DataHubService();
    const remoteConfig = await dhs.create({config});
    const hub = new DataHub({config: remoteConfig, kek, hmac});

    didStore = new DidStore({hub});
  }); // end setup didStore

  it('stores and retrieves a DID', async () => {
    const didDocument = await v1.generate({
      generateKey: kmsApi.generateKey.bind(kmsApi),
    });

    const expectedDoc = didDocument.doc;
    const did = didDocument.id;

    await didStore.insert(didDocument);

    const result = await didStore.get({id: did});

    should.exist(result);
    result.should.be.an('object');
    Object.keys(result).should.have.same.members(['doc', 'meta']);
    const {doc, meta} = result;
    doc.should.eql(expectedDoc);
    meta.should.eql({sequence: 0});
  });
});
