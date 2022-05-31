import { ethers } from 'ethers'
import { UnderwriterTransferRequest } from '../dist/lib/zero'
let example = {
    "requestType": "transfer",
    "module": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
    "to": "0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A",
    "underwriter": "0xa8bd3ffebf92538b3b830dd5b2516a5111db164d",
    "asset": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
    "amount": "0x0493e0",
    "data": "0x00000000000000000000000000000000000000000000000000000000000492b4",
    "nonce": "0x99f0b690a7ef4b177e9de1670000d1131190798f9f889b4a0d896150456567dc",
    "pNonce": "0xfffca9f05133ab1bdd74181ee56e8e41274e7f76b580523fd3f616aa9a5c299d",
    "chainId": 1,
    "contractAddress": "0xa8bd3ffebf92538b3b830dd5b2516a5111db164d",
    "signature": "0x10d133eac49667f30068d5051e2afe8f29e61a158775adbbb00af90fada82f8757b40a12e6958a3555aecf94ada52f9e0c5256eb8ac9c6bb81c232e69044f5391b",
    "_ren": {
        "utils": {},
        "_config": {
            "loadCompletedDeposits": true,
            "logger": {
                "level": 0
            }
        },
        "_logger": {
            "level": 0
        },
        "renVM": {
            "network": {
                "name": "mainnet",
                "lightnode": "https://lightnode-mainnet.herokuapp.com",
                "isTestnet": false
            },
            "v1": {
                "network": {
                    "name": "mainnet",
                    "lightnode": "https://lightnode-mainnet.herokuapp.com",
                    "isTestnet": false
                },
                "logger": {
                    "level": 0
                },
                "provider": {
                    "logger": {
                        "level": 0
                    },
                    "nodeURL": "https://lightnode-mainnet.herokuapp.com"
                }
            },
            "v2": {
                "network": {
                    "name": "mainnet",
                    "lightnode": "https://lightnode-mainnet.herokuapp.com",
                    "isTestnet": false
                },
                "logger": {
                    "level": 0
                },
                "provider": {
                    "logger": {
                        "level": 0
                    },
                    "nodeURL": "https://lightnode-mainnet.herokuapp.com"
                }
            }
        }
    },
    "_contractFn": "zeroCall",
    "_contractParams": [
        {
            "name": "to",
            "type": "address",
            "value": "0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A"
        },
        {
            "name": "pNonce",
            "type": "uint256",
            "value": "0xfffca9f05133ab1bdd74181ee56e8e41274e7f76b580523fd3f616aa9a5c299d"
        },
        {
            "name": "module",
            "type": "address",
            "value": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D"
        },
        {
            "name": "data",
            "type": "bytes",
            "value": "0x0000000000000000000000000000000000000000000000000000000000000000"
        }
    ],
    "callStatic": {},
    "_mint": {
        "_events": {},
        "_eventsCount": 1,
        "deposits": {
            "d955858db1fad5c4a8aa30c1227530a243cff83acc08039f653d7123c5b7b1bc": {
                "depositDetails": {
                    "transaction": {
                        "txHash": "d955858db1fad5c4a8aa30c1227530a243cff83acc08039f653d7123c5b7b1bc",
                        "amount": "300000",
                        "vOut": 0,
                        "confirmations": 0
                    },
                    "amount": "300000"
                },
                "params": {
                    "contractCalls": [
                        {
                            "sendTo": "0xa8bd3ffebf92538b3b830dd5b2516a5111db164d",
                            "contractFn": "zeroCall",
                            "contractParams": [
                                {
                                    "name": "to",
                                    "type": "address",
                                    "value": "0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A"
                                },
                                {
                                    "name": "pNonce",
                                    "type": "uint256",
                                    "value": "0xfffca9f05133ab1bdd74181ee56e8e41274e7f76b580523fd3f616aa9a5c299d"
                                },
                                {
                                    "name": "module",
                                    "type": "address",
                                    "value": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D"
                                },
                                {
                                    "name": "data",
                                    "type": "bytes",
                                    "value": "0x0000000000000000000000000000000000000000000000000000000000000000"
                                }
                            ]
                        }
                    ],
                    "asset": "BTC",
                    "from": {
                        "chain": "Bitcoin",
                        "name": "Bitcoin",
                        "legacyName": "Btc",
                        "asset": "BTC",
                        "api": {
                            "apis": [
                                {
                                    "api": {
                                        "testnet": false
                                    },
                                    "priority": 0
                                },
                                {
                                    "api": {
                                        "network": "bitcoin"
                                    },
                                    "priority": 0
                                },
                                {
                                    "api": {
                                        "network": "BTC"
                                    },
                                    "priority": 15
                                }
                            ]
                        },
                        "utils": {
                            "p2shPrefix": {
                                "mainnet": {
                                    "type": "Buffer",
                                    "data": [
                                        5
                                    ]
                                },
                                "testnet": {
                                    "type": "Buffer",
                                    "data": [
                                        196
                                    ]
                                }
                            }
                        },
                        "chainNetwork": "mainnet",
                        "renNetwork": {
                            "name": "mainnet",
                            "lightnode": "https://lightnode-mainnet.herokuapp.com",
                            "isTestnet": false
                        }
                    },
                    "nonce": {
                        "type": "Buffer",
                        "data": [
                            153,
                            240,
                            182,
                            144,
                            167,
                            239,
                            75,
                            23,
                            126,
                            157,
                            225,
                            103,
                            0,
                            0,
                            209,
                            19,
                            17,
                            144,
                            121,
                            143,
                            159,
                            136,
                            155,
                            74,
                            13,
                            137,
                            97,
                            80,
                            69,
                            101,
                            103,
                            220
                        ]
                    },
                    "to": {
                        "chain": "Ethereum",
                        "name": "Ethereum",
                        "legacyName": "Eth",
                        "configMap": {
                            "mainnet": {
                                "name": "Mainnet",
                                "chain": "main",
                                "isTestnet": false,
                                "chainLabel": "Ethereum",
                                "networkID": 1,
                                "explorer": {},
                                "infura": "https://mainnet.infura.io",
                                "etherscan": "https://etherscan.io",
                                "addresses": {
                                    "GatewayRegistry": "0xe80d347DF1209a76DD9d2319d62912ba98C54DDD",
                                    "BasicAdapter": "0x32666B64e9fD0F44916E1378Efb2CFa3B3B96e80"
                                }
                            },
                            "testnet": {
                                "name": "Testnet",
                                "chain": "kovan",
                                "isTestnet": true,
                                "chainLabel": "Kovan",
                                "networkID": 42,
                                "explorer": {},
                                "infura": "https://kovan.infura.io",
                                "etherscan": "https://kovan.etherscan.io",
                                "addresses": {
                                    "GatewayRegistry": "0x557e211EC5fc9a6737d2C6b7a1aDe3e0C11A8D5D",
                                    "BasicAdapter": "0x7DDFA2e5435027f6e13Ca8Db2f32ebd5551158Bb"
                                }
                            },
                            "devnet": {
                                "name": "Devnet v0.3",
                                "chain": "kovan",
                                "isTestnet": true,
                                "chainLabel": "Kovan",
                                "networkID": 42,
                                "explorer": {},
                                "infura": "https://kovan.infura.io",
                                "etherscan": "https://kovan.etherscan.io",
                                "addresses": {
                                    "GatewayRegistry": "0x5045E727D9D9AcDe1F6DCae52B078EC30dC95455",
                                    "BasicAdapter": "0xFABDB1F53Ef8B080332621cBc9F820a39e7A1B83"
                                }
                            }
                        },
                        "utils": {},
                        "provider": {
                            "_isProvider": true,
                            "_events": [],
                            "_emitted": {
                                "block": -2
                            },
                            "disableCcipRead": false,
                            "formatter": {
                                "formats": {
                                    "transaction": {},
                                    "transactionRequest": {},
                                    "receiptLog": {},
                                    "receipt": {},
                                    "block": {},
                                    "blockWithTransactions": {},
                                    "filter": {},
                                    "filterLog": {}
                                }
                            },
                            "anyNetwork": false,
                            "_networkPromise": {},
                            "_maxInternalBlockNumber": -1024,
                            "_lastBlockNumber": -2,
                            "_maxFilterBlockRange": 10,
                            "_pollingInterval": 4000,
                            "_fastQueryDate": 0,
                            "connection": {
                                "url": "https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2"
                            },
                            "_nextId": 51,
                            "_eventLoopCache": {
                                "detectNetwork": null,
                                "eth_chainId": null
                            },
                            "_network": {
                                "name": "homestead",
                                "chainId": 1,
                                "ensAddress": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
                            }
                        },
                        "signer": {
                            "_isSigner": true,
                            "provider": {
                                "_isProvider": true,
                                "_events": [],
                                "_emitted": {
                                    "block": -2
                                },
                                "disableCcipRead": false,
                                "formatter": {
                                    "formats": {
                                        "transaction": {},
                                        "transactionRequest": {},
                                        "receiptLog": {},
                                        "receipt": {},
                                        "block": {},
                                        "blockWithTransactions": {},
                                        "filter": {},
                                        "filterLog": {}
                                    }
                                },
                                "anyNetwork": false,
                                "_networkPromise": {},
                                "_maxInternalBlockNumber": -1024,
                                "_lastBlockNumber": -2,
                                "_maxFilterBlockRange": 10,
                                "_pollingInterval": 4000,
                                "_fastQueryDate": 0,
                                "connection": {
                                    "url": "https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2"
                                },
                                "_nextId": 51,
                                "_eventLoopCache": {
                                    "detectNetwork": null,
                                    "eth_chainId": null
                                },
                                "_network": {
                                    "name": "homestead",
                                    "chainId": 1,
                                    "ensAddress": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
                                }
                            },
                            "_index": 0,
                            "_address": null
                        },
                        "renNetworkDetails": {
                            "name": "Mainnet",
                            "chain": "main",
                            "isTestnet": false,
                            "chainLabel": "Ethereum",
                            "networkID": 1,
                            "explorer": {},
                            "infura": "https://mainnet.infura.io",
                            "etherscan": "https://etherscan.io",
                            "addresses": {
                                "GatewayRegistry": "0xe80d347DF1209a76DD9d2319d62912ba98C54DDD",
                                "BasicAdapter": "0x32666B64e9fD0F44916E1378Efb2CFa3B3B96e80"
                            }
                        }
                    }
                },
                "renVM": {
                    "network": {
                        "name": "mainnet",
                        "lightnode": "https://lightnode-mainnet.herokuapp.com",
                        "isTestnet": false
                    },
                    "v1": {
                        "network": {
                            "name": "mainnet",
                            "lightnode": "https://lightnode-mainnet.herokuapp.com",
                            "isTestnet": false
                        },
                        "logger": {
                            "level": 0
                        },
                        "provider": {
                            "logger": {
                                "level": 0
                            },
                            "nodeURL": "https://lightnode-mainnet.herokuapp.com"
                        }
                    },
                    "v2": {
                        "network": {
                            "name": "mainnet",
                            "lightnode": "https://lightnode-mainnet.herokuapp.com",
                            "isTestnet": false
                        },
                        "logger": {
                            "level": 0
                        },
                        "provider": {
                            "logger": {
                                "level": 0
                            },
                            "nodeURL": "https://lightnode-mainnet.herokuapp.com"
                        }
                    }
                },
                "gatewayAddress": "3LD2D8GgqstQp3YsriAktgCPftoL7sTRk1",
                "status": "detected",
                "_state": {
                    "logger": {
                        "level": 0
                    },
                    "selector": "BTC0Btc2Eth",
                    "config": {
                        "loadCompletedDeposits": true,
                        "logger": {
                            "level": 0
                        },
                        "networkDelay": 15000
                    },
                    "renNetwork": {
                        "name": "mainnet",
                        "lightnode": "https://lightnode-mainnet.herokuapp.com",
                        "isTestnet": false
                    },
                    "pHash": {
                        "type": "Buffer",
                        "data": [
                            171,
                            136,
                            157,
                            6,
                            252,
                            62,
                            18,
                            188,
                            245,
                            135,
                            75,
                            184,
                            225,
                            29,
                            188,
                            207,
                            214,
                            107,
                            167,
                            4,
                            43,
                            221,
                            219,
                            80,
                            56,
                            165,
                            215,
                            177,
                            152,
                            104,
                            248,
                            116
                        ]
                    },
                    "gHash": {
                        "type": "Buffer",
                        "data": [
                            108,
                            229,
                            88,
                            248,
                            80,
                            247,
                            138,
                            208,
                            51,
                            237,
                            236,
                            177,
                            56,
                            242,
                            46,
                            242,
                            216,
                            156,
                            36,
                            125,
                            50,
                            144,
                            253,
                            126,
                            172,
                            122,
                            42,
                            19,
                            247,
                            55,
                            47,
                            17
                        ]
                    },
                    "gPubKey": {
                        "type": "Buffer",
                        "data": [
                            3,
                            160,
                            46,
                            147,
                            207,
                            140,
                            71,
                            178,
                            80,
                            7,
                            91,
                            10,
                            246,
                            31,
                            150,
                            235,
                            209,
                            3,
                            118,
                            192,
                            170,
                            167,
                            99,
                            81,
                            72,
                            232,
                            137,
                            203,
                            43,
                            81,
                            201,
                            105,
                            39
                        ]
                    },
                    "token": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
                    "targetConfirmations": 6,
                    "nHash": {
                        "type": "Buffer",
                        "data": [
                            223,
                            67,
                            168,
                            98,
                            237,
                            255,
                            99,
                            255,
                            241,
                            147,
                            128,
                            181,
                            97,
                            37,
                            156,
                            102,
                            253,
                            38,
                            205,
                            251,
                            75,
                            2,
                            120,
                            249,
                            171,
                            142,
                            239,
                            58,
                            139,
                            22,
                            105,
                            95
                        ]
                    },
                    "nonce": {
                        "type": "Buffer",
                        "data": [
                            153,
                            240,
                            182,
                            144,
                            167,
                            239,
                            75,
                            23,
                            126,
                            157,
                            225,
                            103,
                            0,
                            0,
                            209,
                            19,
                            17,
                            144,
                            121,
                            143,
                            159,
                            136,
                            155,
                            74,
                            13,
                            137,
                            97,
                            80,
                            69,
                            101,
                            103,
                            220
                        ]
                    },
                    "output": {
                        "txid": {
                            "type": "Buffer",
                            "data": [
                                217,
                                85,
                                133,
                                141,
                                177,
                                250,
                                213,
                                196,
                                168,
                                170,
                                48,
                                193,
                                34,
                                117,
                                48,
                                162,
                                67,
                                207,
                                248,
                                58,
                                204,
                                8,
                                3,
                                159,
                                101,
                                61,
                                113,
                                35,
                                197,
                                183,
                                177,
                                188
                            ]
                        },
                        "txindex": "0"
                    },
                    "amount": "300000",
                    "payload": {
                        "type": "Buffer",
                        "data": [
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            70,
                            247,
                            26,
                            91,
                            58,
                            207,
                            112,
                            204,
                            30,
                            171,
                            131,
                            35,
                            76,
                            21,
                            138,
                            39,
                            243,
                            80,
                            198,
                            106,
                            255,
                            252,
                            169,
                            240,
                            81,
                            51,
                            171,
                            27,
                            221,
                            116,
                            24,
                            30,
                            229,
                            110,
                            142,
                            65,
                            39,
                            78,
                            127,
                            118,
                            181,
                            128,
                            82,
                            63,
                            211,
                            246,
                            22,
                            170,
                            154,
                            92,
                            41,
                            157,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            235,
                            76,
                            39,
                            129,
                            228,
                            235,
                            168,
                            4,
                            206,
                            154,
                            152,
                            3,
                            198,
                            125,
                            8,
                            147,
                            67,
                            107,
                            178,
                            125,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            128,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            32,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0
                        ]
                    },
                    "to": "0xa8bd3ffebf92538b3b830dd5b2516a5111db164d",
                    "fn": "zeroCall",
                    "fnABI": [
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "type": "address",
                                    "name": "to"
                                },
                                {
                                    "type": "uint256",
                                    "name": "pNonce"
                                },
                                {
                                    "type": "address",
                                    "name": "module"
                                },
                                {
                                    "type": "bytes",
                                    "name": "data"
                                },
                                {
                                    "name": "_amount",
                                    "type": "uint256"
                                },
                                {
                                    "name": "_nHash",
                                    "type": "bytes32"
                                },
                                {
                                    "name": "_sig",
                                    "type": "bytes"
                                }
                            ],
                            "outputs": [],
                            "payable": true,
                            "stateMutability": "payable",
                            "type": "function",
                            "name": "zeroCall"
                        }
                    ],
                    "tags": [],
                    "txHash": "84eHWtZqmz3p8/CeUX5YVUPujrFQRs5uXaC8y0LRzuU=",
                    "renTxSubmitted": false
                }
            }
        },
        "params": {
            "contractCalls": [
                {
                    "sendTo": "0xa8bd3ffebf92538b3b830dd5b2516a5111db164d",
                    "contractFn": "zeroCall",
                    "contractParams": [
                        {
                            "name": "to",
                            "type": "address",
                            "value": "0x46F71A5b3aCF70cc1Eab83234c158A27F350c66A"
                        },
                        {
                            "name": "pNonce",
                            "type": "uint256",
                            "value": "0xfffca9f05133ab1bdd74181ee56e8e41274e7f76b580523fd3f616aa9a5c299d"
                        },
                        {
                            "name": "module",
                            "type": "address",
                            "value": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D"
                        },
                        {
                            "name": "data",
                            "type": "bytes",
                            "value": "0x0000000000000000000000000000000000000000000000000000000000000000"
                        }
                    ]
                }
            ],
            "asset": "BTC",
            "from": {
                "chain": "Bitcoin",
                "name": "Bitcoin",
                "legacyName": "Btc",
                "asset": "BTC",
                "api": {
                    "apis": [
                        {
                            "api": {
                                "testnet": false
                            },
                            "priority": 0
                        },
                        {
                            "api": {
                                "network": "bitcoin"
                            },
                            "priority": 0
                        },
                        {
                            "api": {
                                "network": "BTC"
                            },
                            "priority": 15
                        }
                    ]
                },
                "utils": {
                    "p2shPrefix": {
                        "mainnet": {
                            "type": "Buffer",
                            "data": [
                                5
                            ]
                        },
                        "testnet": {
                            "type": "Buffer",
                            "data": [
                                196
                            ]
                        }
                    }
                },
                "chainNetwork": "mainnet",
                "renNetwork": {
                    "name": "mainnet",
                    "lightnode": "https://lightnode-mainnet.herokuapp.com",
                    "isTestnet": false
                }
            },
            "nonce": {
                "type": "Buffer",
                "data": [
                    153,
                    240,
                    182,
                    144,
                    167,
                    239,
                    75,
                    23,
                    126,
                    157,
                    225,
                    103,
                    0,
                    0,
                    209,
                    19,
                    17,
                    144,
                    121,
                    143,
                    159,
                    136,
                    155,
                    74,
                    13,
                    137,
                    97,
                    80,
                    69,
                    101,
                    103,
                    220
                ]
            },
            "to": {
                "chain": "Ethereum",
                "name": "Ethereum",
                "legacyName": "Eth",
                "configMap": {
                    "mainnet": {
                        "name": "Mainnet",
                        "chain": "main",
                        "isTestnet": false,
                        "chainLabel": "Ethereum",
                        "networkID": 1,
                        "explorer": {},
                        "infura": "https://mainnet.infura.io",
                        "etherscan": "https://etherscan.io",
                        "addresses": {
                            "GatewayRegistry": "0xe80d347DF1209a76DD9d2319d62912ba98C54DDD",
                            "BasicAdapter": "0x32666B64e9fD0F44916E1378Efb2CFa3B3B96e80"
                        }
                    },
                    "testnet": {
                        "name": "Testnet",
                        "chain": "kovan",
                        "isTestnet": true,
                        "chainLabel": "Kovan",
                        "networkID": 42,
                        "explorer": {},
                        "infura": "https://kovan.infura.io",
                        "etherscan": "https://kovan.etherscan.io",
                        "addresses": {
                            "GatewayRegistry": "0x557e211EC5fc9a6737d2C6b7a1aDe3e0C11A8D5D",
                            "BasicAdapter": "0x7DDFA2e5435027f6e13Ca8Db2f32ebd5551158Bb"
                        }
                    },
                    "devnet": {
                        "name": "Devnet v0.3",
                        "chain": "kovan",
                        "isTestnet": true,
                        "chainLabel": "Kovan",
                        "networkID": 42,
                        "explorer": {},
                        "infura": "https://kovan.infura.io",
                        "etherscan": "https://kovan.etherscan.io",
                        "addresses": {
                            "GatewayRegistry": "0x5045E727D9D9AcDe1F6DCae52B078EC30dC95455",
                            "BasicAdapter": "0xFABDB1F53Ef8B080332621cBc9F820a39e7A1B83"
                        }
                    }
                },
                "utils": {},
                "provider": {
                    "_isProvider": true,
                    "_events": [],
                    "_emitted": {
                        "block": -2
                    },
                    "disableCcipRead": false,
                    "formatter": {
                        "formats": {
                            "transaction": {},
                            "transactionRequest": {},
                            "receiptLog": {},
                            "receipt": {},
                            "block": {},
                            "blockWithTransactions": {},
                            "filter": {},
                            "filterLog": {}
                        }
                    },
                    "anyNetwork": false,
                    "_networkPromise": {},
                    "_maxInternalBlockNumber": -1024,
                    "_lastBlockNumber": -2,
                    "_maxFilterBlockRange": 10,
                    "_pollingInterval": 4000,
                    "_fastQueryDate": 0,
                    "connection": {
                        "url": "https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2"
                    },
                    "_nextId": 51,
                    "_eventLoopCache": {
                        "detectNetwork": null,
                        "eth_chainId": null
                    },
                    "_network": {
                        "name": "homestead",
                        "chainId": 1,
                        "ensAddress": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
                    }
                },
                "signer": {
                    "_isSigner": true,
                    "provider": {
                        "_isProvider": true,
                        "_events": [],
                        "_emitted": {
                            "block": -2
                        },
                        "disableCcipRead": false,
                        "formatter": {
                            "formats": {
                                "transaction": {},
                                "transactionRequest": {},
                                "receiptLog": {},
                                "receipt": {},
                                "block": {},
                                "blockWithTransactions": {},
                                "filter": {},
                                "filterLog": {}
                            }
                        },
                        "anyNetwork": false,
                        "_networkPromise": {},
                        "_maxInternalBlockNumber": -1024,
                        "_lastBlockNumber": -2,
                        "_maxFilterBlockRange": 10,
                        "_pollingInterval": 4000,
                        "_fastQueryDate": 0,
                        "connection": {
                            "url": "https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2"
                        },
                        "_nextId": 51,
                        "_eventLoopCache": {
                            "detectNetwork": null,
                            "eth_chainId": null
                        },
                        "_network": {
                            "name": "homestead",
                            "chainId": 1,
                            "ensAddress": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
                        }
                    },
                    "_index": 0,
                    "_address": null
                },
                "renNetworkDetails": {
                    "name": "Mainnet",
                    "chain": "main",
                    "isTestnet": false,
                    "chainLabel": "Ethereum",
                    "networkID": 1,
                    "explorer": {},
                    "infura": "https://mainnet.infura.io",
                    "etherscan": "https://etherscan.io",
                    "addresses": {
                        "GatewayRegistry": "0xe80d347DF1209a76DD9d2319d62912ba98C54DDD",
                        "BasicAdapter": "0x32666B64e9fD0F44916E1378Efb2CFa3B3B96e80"
                    }
                }
            }
        },
        "renVM": {
            "network": {
                "name": "mainnet",
                "lightnode": "https://lightnode-mainnet.herokuapp.com",
                "isTestnet": false
            },
            "v1": {
                "network": {
                    "name": "mainnet",
                    "lightnode": "https://lightnode-mainnet.herokuapp.com",
                    "isTestnet": false
                },
                "logger": {
                    "level": 0
                },
                "provider": {
                    "logger": {
                        "level": 0
                    },
                    "nodeURL": "https://lightnode-mainnet.herokuapp.com"
                }
            },
            "v2": {
                "network": {
                    "name": "mainnet",
                    "lightnode": "https://lightnode-mainnet.herokuapp.com",
                    "isTestnet": false
                },
                "logger": {
                    "level": 0
                },
                "provider": {
                    "logger": {
                        "level": 0
                    },
                    "nodeURL": "https://lightnode-mainnet.herokuapp.com"
                }
            }
        },
        "_state": {
            "logger": {
                "level": 0
            },
            "selector": "BTC0Btc2Eth",
            "config": {
                "loadCompletedDeposits": true,
                "logger": {
                    "level": 0
                },
                "networkDelay": 15000
            },
            "renNetwork": {
                "name": "mainnet",
                "lightnode": "https://lightnode-mainnet.herokuapp.com",
                "isTestnet": false
            },
            "pHash": {
                "type": "Buffer",
                "data": [
                    171,
                    136,
                    157,
                    6,
                    252,
                    62,
                    18,
                    188,
                    245,
                    135,
                    75,
                    184,
                    225,
                    29,
                    188,
                    207,
                    214,
                    107,
                    167,
                    4,
                    43,
                    221,
                    219,
                    80,
                    56,
                    165,
                    215,
                    177,
                    152,
                    104,
                    248,
                    116
                ]
            },
            "gHash": {
                "type": "Buffer",
                "data": [
                    108,
                    229,
                    88,
                    248,
                    80,
                    247,
                    138,
                    208,
                    51,
                    237,
                    236,
                    177,
                    56,
                    242,
                    46,
                    242,
                    216,
                    156,
                    36,
                    125,
                    50,
                    144,
                    253,
                    126,
                    172,
                    122,
                    42,
                    19,
                    247,
                    55,
                    47,
                    17
                ]
            },
            "gPubKey": {
                "type": "Buffer",
                "data": [
                    3,
                    160,
                    46,
                    147,
                    207,
                    140,
                    71,
                    178,
                    80,
                    7,
                    91,
                    10,
                    246,
                    31,
                    150,
                    235,
                    209,
                    3,
                    118,
                    192,
                    170,
                    167,
                    99,
                    81,
                    72,
                    232,
                    137,
                    203,
                    43,
                    81,
                    201,
                    105,
                    39
                ]
            },
            "token": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
            "targetConfirmations": 6
        },
        "gatewayAddress": "3LD2D8GgqstQp3YsriAktgCPftoL7sTRk1",
        "getDepositsProgress": true
    }
}

( async () => {
    const  transferRequest = new zero.UnderwriterTransferRequest(
        ...example
    )

    const response = await transferRequest.submitToRenVM()
})
