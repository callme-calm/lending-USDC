import React, { useState, useEffect } from 'react';
import './App.css';
import { ethers } from 'ethers';

const ARBITRUM_SEPOLIA_RPC_URL = 'https://arb-sepolia.infura.io/v3/PROJECT_ID';
const USDC_ADDRESS = '0xUSDCAddressOnSepolia';
const LENDING_POOL_ADDRESS = '0xLendingPoolAddressOnSepolia';

//  ABI to interact with the LendingPool contract
const LENDING_POOL_ABI = [
  {
    "constant": true,
    "inputs": [
      { "name": "asset", "type": "address" }
    ],
    "name": "getReserveData",
    "outputs": [
      { "name": "lastUpdateTimestamp", "type": "uint256" },
      { "name": "liquidityRate", "type": "uint256" },
      { "name": "variableBorrowRate", "type": "uint256" },
      { "name": "stableBorrowRate", "type": "uint256" },
      { "name": "averageStableBorrowRate", "type": "uint256" },
      { "name": "utilizationRate", "type": "uint256" }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

const LendUSDC = () => {
  const [amount, setAmount] = useState('');
  const [apy, setApy] = useState(null);
  const [calldata, setCalldata] = useState('');

  useEffect(() => {
    const fetchAPY = async () => {
      try {
        // provider instance
        const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC_URL);
        
        // provider is connected
        const network = await provider.getNetwork();
        console.log('Network:', network);

        //  contract instance
        const lendingPoolContract = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, provider);

        //  reserve data
        const reserveData = await lendingPoolContract.getReserveData(USDC_ADDRESS);

        // liquidity rate  to percentage
        const liquidityRate = reserveData.liquidityRate;
        const apy = liquidityRate / 1e27; //  Ray to percentage
        setApy(apy.toFixed(2) + '%');
      } catch (error) {
        console.error('Error fetching APY:', error.message);
        setApy('Error fetching APY');
      }
    };

    fetchAPY();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
           
        const provider = new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC_URL);
        const lendingPoolContract = new ethers.Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, provider);

        const amountInWei = ethers.parseUnits(amount, 6); 

        const data = lendingPoolContract.interface.encodeFunctionData('deposit', [
          USDC_ADDRESS,
          amountInWei,
          '0x0000000000000000000000000000000000000000', // wallet address
          0,
        ]);

        setCalldata(data);
  };

  return (
    <div>
      <h1>Lend USDC on Aave</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Asset: USDC</label>
        </div>
        <div>
          <label>
            Amount:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>APY: {apy}</label>
        </div>
        <button type="submit">Submit</button>
      </form>
      {calldata && (
        <div>
          <h2>Generated Calldata</h2>
          <pre>{calldata}</pre>
        </div>
      )}
    </div>
  );
};

export default LendUSDC;
