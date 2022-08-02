import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
// import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-preprocessor";
import { readFileSync } from "fs";
import { ethers } from "ethers";
import { randomBytes } from "crypto";
import * as deployParameters from "@zerodao/protocol/lib/fixtures";
require("dotenv").config();
require("./tasks/multisig");
require("./tasks/init-multisig");

function getRemappings() {
  return readFileSync("remappings.txt", "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.trim().split("="));
}

if (!process.env.CHAIN_ID && process.env.CHAIN === "ARBITRUM")
  process.env.CHAIN_ID = "42161";
if (!process.env.CHAIN_ID && process.env.CHAIN === "MATIC")
  process.env.CHAIN_ID = "137";
if (!process.env.CHAIN_ID && process.env.CHAIN === "ETHEREUM")
  process.env.CHAIN_ID = "1";

const RPC_ENDPOINTS = {
  ARBITRUM: "https://arb1.arbitrum.io/rpc",
  MATIC:
    "https://polygon-mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2",
  ETHEREUM: "https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2",
};

declare var extendEnvironment;
extendEnvironment(async (hre) => {
  if (process.argv.slice(1).includes("node")) {
    (async () => {
      const artifact = require("./artifacts/contracts/test/MockGatewayLogicV1.sol/MockGatewayLogicV1");
      await hre.network.provider.send("hardhat_setCode", [
        hre.ethers.utils.getAddress(
          deployParameters[process.env.CHAIN].btcGateway
        ),
        artifact.deployedBytecode,
      ]);
    })().catch((err) => console.error(err));
  }
});

let wallet = process.env.WALLET;

if (process.env.SIGNER_PATH && process.env.PASSWORD) {
  wallet = ethers.Wallet.fromEncryptedJsonSync(
    readFileSync(process.env.SIGNER_PATH).toString(),
    process.env.PASSWORD
  )._signingKey().privateKey;
}

const accounts = [
  wallet || randomBytes(32).toString("hex"),
  process.env.UNDERWRITER || randomBytes(32).toString("hex"),
];

process.env.ETHEREUM_MAINNET_URL =
  process.env.ETHEREUM_MAINNET_URL ||
  "https://mainnet.infura.io/v3/816df2901a454b18b7df259e61f92cd2";

const ETHERSCAN_API_KEYS = {
  ARBITRUM: "7PW6SPNBFYV1EM5E5NT36JW7ARMS1FB4HW",
  MATIC: "I13U9EN9YQ9931GYK9CJYQS9ZF51D5Z1F9",
  ETHEREUM: "34W9GX5VZDJKJKVV6YEAMQ3TDP7R8SR633",
};

const ETHERSCAN_API_KEY =
  ETHERSCAN_API_KEYS[process.env.CHAIN || "ARBITRUM"] ||
  ETHERSCAN_API_KEYS["ARBITRUM"];

module.exports = {
  defaultNetwork: "hardhat",
  abiExporter: {
    path: "./abi",
    clear: false,
    flat: true,
  },
  networks: {
    mainnet: {
      url: process.env.ETHEREUM_MAINNET_URL,
      accounts,
      chainId: 1,
    },
    // localhost: {
    // 	live: false,
    // 	saveDeployments: true,
    // 	tags: ['development'],
    // },
    localhost: {
      live: false,
      saveDeployments: true,
      tags: ["local"],
    },
    hardhat: {
      live: false,
      saveDeployments: true,
      tags: ["development", "test"],
      chainId: process.env.CHAIN_ID && Number(process.env.CHAIN_ID),
      allowUnlimitedContractSize: true,
      forking: {
        enabled: process.env.FORKING === "true",
        url: RPC_ENDPOINTS[process.env.CHAIN || "ETHEREUM"],
      },
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts,
      chainId: 43114,
      live: true,
      saveDeployments: true,
      gasPrice: 470000000000,
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts,
      chainId: 137,
      live: true,
      saveDeployments: true,
    },
    arbitrum: {
      url: RPC_ENDPOINTS.ARBITRUM,
      accounts,
      chainId: 42161,
      live: true,
      saveDeployments: true,
      blockGasLimit: 700000,
    },
  },
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: "USD",
    enabled: process.env.REPORT_GAS === "true",
    excludeContracts: ["contracts/libraries/"],
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5,
          },
        },
      },
      {
        version: "0.8.15",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 50000,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    underwriter: {
      default: 1,
    },
  },
  mocha: {
    timeout: 0,
    grep: process.env.GREP,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  preprocess: {
    eachLine: (hre) => ({
      transform: (line: string) => {
        if (line.match(/^\s*import /i)) {
          getRemappings().forEach(([find, replace]) => {
            if (line.match(find)) {
              line = line.replace(find, replace);
            }
          });
        }
        return line;
      },
    }),
  },
};
