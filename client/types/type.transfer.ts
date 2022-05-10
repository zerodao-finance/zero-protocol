import { ethers } from 'ethers';

interface TransferRequestInterface {
  zeroUser: any; //TODO
  amount: number;
  token: string;
  ratio: number;
  signer: any; //TODO
  to: number;
  isFast: boolean;
  data: string; //TODO
}

interface BurnRequestInterface {
  zeroUser: any; //TODO
  amount: number;
  to: string;
  deadline: ethers.BigNumber;
  signer: any; //TODO
  destination: string;
}