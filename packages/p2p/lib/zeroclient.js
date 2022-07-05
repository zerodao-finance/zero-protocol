'use strict';
import pipe from 'it-pipe';
import lp from 'it-length-prefixed';
const peerId = require("peer-id");
import { EventEmitter } from 'events';
import { utils } from 'ethers';
import { deepCopy } from '@ethersproject/properties';


class ZeroUser extends EventEmitter {
    conn: ConnectionTypes;
    keepers: string[];
    log: Logger;
    _pending: Object;

    constructor(connection: ConnectionTypes) {
        super()
    }
}