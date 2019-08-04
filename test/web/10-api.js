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
  it('creates a data hub with a new DID as the controller', async () => {
    // this test does not use the datahub setup in before
    const didDocument = await v1.generate({
      generateKey: kmsApi.generateKey.bind(kmsApi),
    });

    // FIXME: attempting to create a datahub with a DID as the controller based
    // on step 3 in the "Using DIDs in a Web Application" spec that states:
    // Create a Data Hub where `config.controller` is the new DID

    // FIXME: the creation of the datahub fails because `config.controller`
    // is expected to be the bedrock-account.id or the permission check on
    // creating a datahub fails

    const did = didDocument.id;
    // Use the Master Key to create KEK and HMAC keys
    const kek = await kmsApi.generateKey({type: 'kek'});
    const hmac = await kmsApi.generateKey({type: 'hmac'});

    const config = {
      sequence: 0,
      controller: did,
      primary: true,
      kek: {id: kek.id, algorithm: kek.algorithm},
      hmac: {id: hmac.id, algorithm: hmac.algorithm}
    };

    const dhs = new DataHubService();
    const remoteConfig = await dhs.create({config});
    const hub = new DataHub({config: remoteConfig, kek, hmac});

    didStore = new DidStore({hub});
  });
});
