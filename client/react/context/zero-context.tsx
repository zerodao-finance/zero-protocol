import * as React from 'react';
import { ethers } from 'ethers';
import _ from 'lodash';

function assertNever(x) {
  throw new Error("unexpected object " + x)
}

interface ZeroStateInterface {
  keepers: [any],
  zeroUser: any,
  signer: any,
  controller: any,
  isLoading: boolean,
  error: any
}

const initialState = {
    keepers: [],
    zeroUser: null,
    signer: null,
    controller: null,
    isLoading: false,
    error: null
}

function stateReducer(state, action){
  switch (action.type) {
    case 'found_keeper':
      return state // TODO
      break;
    case 'wallet_connected':
      return state // TODO
      break;
    default:
      assertNever(action.type)
  }
}

const zeroContext = React.createContext(initialState)
const { Provider } = zeroContext;


function ZeroStateProvider({children}) {
  const [ zeroState, zeroDispatch ] = React.useReducer(stateReducer, initialState)
  
  return <Provider value={{ ...zeroState, zeroDispatch}}>{children}</Provider>
}

