import * as React from 'react';

function useTransferRequestSend(form) {
  const [ isLoading, setLoading ] = React.useState(false)
  const [ isSigning, setIsSigning ] = React.useState(false)
  const [ isError, setIsError ] = React.useState(false)

  //handle submitting form
  //return a Promise that will resolve a Gateway address
  //return a Promise that will expose a inFlight Object

  return { 
    send,
    isLoading,
    isSigning,
    isError,
    //Promise(Gateway),
    //Promise(inFlight)
  }
}