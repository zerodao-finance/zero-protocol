pragma solidity ^0.5.0;

import {GatewayLogicV1} from './GatewayLogicV1.sol';

contract MockGatewayLogicV1 is GatewayLogicV1 {
	function verifySignature(
		bytes32, /* _signedMessageHash */
		bytes memory /* _sig */
	) public view returns (bool) {
		assembly {
			pop(sload(0x0)) // make compiler ignore that it should be a pure function
		}
		return true; // just pretend it really came from renVM
	}
}
