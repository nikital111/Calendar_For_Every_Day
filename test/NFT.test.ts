/* eslint-disable jest/valid-expect */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { Calendar_For_Every_Day } from "../typechain-types/contracts";
const { expect } = require("chai");
const { ethers } = require("hardhat");
import addresses from "./addresses.json";

describe("NFT", function () {
  async function deployNFTFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTFactory = await ethers.getContractFactory(
      "Calendar_For_Every_Day"
    );

    const myAddresses = [...addresses];
    myAddresses[51] = owner.address;
    myAddresses[199] = otherAccount.address;
    const nft: Calendar_For_Every_Day = await NFTFactory.deploy(myAddresses);

    await nft.deployed();

    const price = await nft.price();

    return { nft, owner, price, otherAccount };
  }

  async function deployNFTFixturePREMINT() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTFactory = await ethers.getContractFactory(
      "Calendar_For_Every_Day"
    );
    const myAddresses = [...addresses];
    myAddresses[51] = owner.address;
    myAddresses[199] = otherAccount.address;
    const nft: Calendar_For_Every_Day = await NFTFactory.deploy(myAddresses);

    await nft.deployed();

    await nft.changeStatus(1);

    const price = await nft.price();

    return { nft, owner, price, otherAccount };
  }

  async function deployNFTFixtureMINT() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTFactory = await ethers.getContractFactory(
      "Calendar_For_Every_Day"
    );
    const myAddresses = [...addresses];
    myAddresses[51] = owner.address;
    myAddresses[199] = otherAccount.address;
    const nft: Calendar_For_Every_Day = await NFTFactory.deploy(myAddresses);

    await nft.deployed();

    await nft.changeStatus(1);

    const price = await nft.price();

    return { nft, owner, price, otherAccount };
  }

  async function deployNFTFixtureMINTED() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const count = 10;

    const NFTFactory = await ethers.getContractFactory(
      "Calendar_For_Every_Day"
    );
    const myAddresses = [...addresses];
    myAddresses[51] = owner.address;
    myAddresses[199] = otherAccount.address;
    const nft: Calendar_For_Every_Day = await NFTFactory.deploy(myAddresses);

    await nft.deployed();

    await nft.changeStatus(1);

    const price = await nft.price();

    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });

    return { nft, owner, price, otherAccount, count };
  }

  async function deployNFTFixtureAllMINTED() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const count = 500;

    const NFTFactory = await ethers.getContractFactory(
      "Calendar_For_Every_Day"
    );
    const myAddresses = [...addresses];
    myAddresses[51] = owner.address;
    myAddresses[199] = otherAccount.address;
    const nft: Calendar_For_Every_Day = await NFTFactory.deploy(myAddresses);

    await nft.deployed();

    await nft.changeStatus(1);

    const price = await nft.price();

    // 1 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });
    // 2 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });
    // 3 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });
    // 4 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });

    return { nft, owner, otherAccount };
  }

  it("should be deployed", async function () {
    const { nft, owner } = await loadFixture(deployNFTFixture);

    const supply = await nft.totalSupply();
    const contractURI = await nft.contractURI();
    const ownerOfContract = await nft.owner();
    const status = await nft.status();

    expect(nft.address).to.be.properAddress;
    expect(supply).to.eq(0);
    // expect(contractURI).to.eq(
    //   "ipfs://Qmdf9A4JsqTydaucvGJ2V3GzsrW4XRLZENQTH2SQSQWkHZ"
    // );
    expect(ownerOfContract).to.eq(owner.address);
    expect(status).to.eq(0);
    console.log("address is valid");
  });

  it("change status", async function () {
    const { nft, owner, price, otherAccount } = await loadFixture(
      deployNFTFixture
    );

    await nft.changeStatus(1);

    const status1 = await nft.status();

    await nft.changeStatus(0);

    const status0 = await nft.status();

    expect(status1).to.eq(1);
    expect(status0).to.eq(0);

    //reverts

    await expect(nft.connect(otherAccount).changeStatus(1)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("change price", async function () {
    const { nft, owner, price, otherAccount } = await loadFixture(
      deployNFTFixture
    );

    await nft.changePrice(ethers.utils.parseEther("0.42"));

    const price2 = await nft.price();

    expect(price2).to.eq(ethers.utils.parseEther("0.42"));

    //reverts

    await expect(
      nft.connect(otherAccount).changePrice(ethers.utils.parseEther("3.12"))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(nft.changePrice(0)).to.be.revertedWith("Incorrect price");
  });

  it("mint", async function () {
    const { nft, owner, price, otherAccount } = await loadFixture(
      deployNFTFixtureMINT
    );
    const address0 = "0x0000000000000000000000000000000000000000";
    const totalSupplyBefore = await nft.totalSupply();
    const numToMint = 30;

    const mintTx = await nft
      .connect(otherAccount)
      .safeMint(otherAccount.address, numToMint, {
        value: price.mul(numToMint),
      });

    await expect(mintTx).to.emit(nft, "Transfer");

    await expect(mintTx).to.changeEtherBalances(
      [otherAccount.address, nft.address],
      [price.mul(-numToMint), price.mul(numToMint)]
    );

    const balanceNFT = await nft.balanceOf(otherAccount.address);
    const totalSupplyAfter = await nft.totalSupply();

    expect(balanceNFT).to.eq(numToMint);
    expect(totalSupplyAfter).to.eq(totalSupplyBefore.toNumber() + numToMint);

    //reverts

    await expect(
      nft
        .connect(otherAccount)
        .safeMint(otherAccount.address, 1, { value: price.sub(1) })
    ).to.be.revertedWith("Wrong amount");

    await nft.changePrice(ethers.utils.parseEther("2"));

    await expect(
      nft
        .connect(otherAccount)
        .safeMint(otherAccount.address, 1, { value: price })
    ).to.be.revertedWith("Wrong amount");

    await nft.changePrice(ethers.utils.parseEther("1"));
    await nft.changeStatus(0);

    await expect(
      nft.safeMint(owner.address, 1, { value: price })
    ).to.be.revertedWith("Mint paused");
  });

  it("withdraw", async function () {
    const { nft, owner, price, otherAccount, count } = await loadFixture(
      deployNFTFixtureMINTED
    );
    const receivers = [owner.address, otherAccount.address];
    const balance = await ethers.provider.getBalance(nft.address);

    expect(balance).to.eq(price.mul(count));

    const withdraw = await nft.withdraw(1);

    await expect(withdraw).to.changeEtherBalances(
      [nft.address, owner.address],
      [-1, 1]
    );

    const afterBalance = await ethers.provider.getBalance(nft.address);

    expect(afterBalance).to.eq(balance.sub(1));

    //reverts

    await expect(nft.connect(otherAccount).withdraw(1)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("test payouts", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);
    const count = 500;
    await nft.changeStatus(1);
    const price = await nft.price();
    const onePay = await nft.payout();

    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });

    const allowed = await nft.checkPayout();
    expect(allowed).to.eq(false);

    await expect(nft.requestPayout()).to.be.revertedWith("Not yet");

    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });

    const allowed2 = await nft.checkPayout();
    expect(allowed2).to.eq(true);

    // 100 accs for test
    const pay = await nft.requestPayout();

    await expect(pay).to.changeEtherBalances(
      [nft.address, owner.address],
      [-onePay, onePay]
    );
  });

  it("approve nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(
      deployNFTFixtureAllMINTED
    );

    const approveTx = await nft.approve(otherAccount.address, 1623);

    await expect(approveTx)
      .to.emit(nft, "Approval")
      .withArgs(owner.address, otherAccount.address, 1623);

    const getApproveTx = await nft.getApproved(1623);

    expect(getApproveTx).to.eq(otherAccount.address);

    //reverts
    await expect(
      nft.connect(otherAccount).approve(otherAccount.address, 512)
    ).to.be.revertedWith(
      "ERC721: approve caller is not token owner or approved for all"
    );
  });

  it("approve all nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(
      deployNFTFixtureAllMINTED
    );

    const approveAllTx = await nft.setApprovalForAll(
      otherAccount.address,
      true
    );

    await expect(approveAllTx)
      .to.emit(nft, "ApprovalForAll")
      .withArgs(owner.address, otherAccount.address, true);

    const getApproveAllTx = await nft.isApprovedForAll(
      owner.address,
      otherAccount.address
    );

    expect(getApproveAllTx).to.eq(true);
  });

  it("transfer nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(
      deployNFTFixtureAllMINTED
    );
    const address0 = "0x0000000000000000000000000000000000000000";
    const totalSupply: any = await nft.totalSupply();

    // await nft.approve(otherAccount.address, 1);

    const transferTx = await nft["safeTransferFrom(address,address,uint256)"](
      owner.address,
      otherAccount.address,
      1512
    );

    await expect(transferTx)
      .to.emit(nft, "Transfer")
      .withArgs(owner.address, otherAccount.address, 1512);

    const balanceOwner = await nft.balanceOf(owner.address);
    const balanceotherAccount = await nft.balanceOf(otherAccount.address);

    const ownerOfToken = await nft.ownerOf(1512);

    expect(balanceOwner).to.eq(totalSupply - 1);
    expect(balanceotherAccount).to.eq(1);
    expect(ownerOfToken).to.eq(otherAccount.address);

    //reverts
    await expect(
      nft
        .connect(otherAccount)
        ["safeTransferFrom(address,address,uint256)"](
          owner.address,
          otherAccount.address,
          1512
        )
    ).to.be.revertedWith("ERC721: transfer from incorrect owner");

    await expect(
      nft["safeTransferFrom(address,address,uint256)"](
        owner.address,
        address0,
        214
      )
    ).to.be.revertedWith("ERC721: transfer to the zero address");
  });

  it("transfer from nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(
      deployNFTFixtureAllMINTED
    );

    const address0 = "0x0000000000000000000000000000000000000000";
    const totalSupply: any = await nft.totalSupply();
    // await nft.approve(otherAccount.address, 1);
    await nft.setApprovalForAll(otherAccount.address, true);

    const transferTx = await nft
      .connect(otherAccount)
      ["safeTransferFrom(address,address,uint256)"](
        owner.address,
        otherAccount.address,
        412
      );

    await expect(transferTx)
      .to.emit(nft, "Transfer")
      .withArgs(owner.address, otherAccount.address, 412);

    const balanceOwner = await nft.balanceOf(owner.address);
    const balanceotherAccount = await nft.balanceOf(otherAccount.address);

    const onerOfToken = await nft.ownerOf(412);

    expect(balanceOwner).to.eq(totalSupply - 1);
    expect(balanceotherAccount).to.eq(1);
    expect(onerOfToken).to.eq(otherAccount.address);

    //reverts
    await expect(
      nft
        .connect(otherAccount)
        ["safeTransferFrom(address,address,uint256)"](
          owner.address,
          address0,
          512
        )
    ).to.be.revertedWith("ERC721: transfer to the zero address");
  });

  it("change URIs", async function () {
    const { nft, owner, otherAccount } = await loadFixture(
      deployNFTFixtureAllMINTED
    );

    const newUri = "newUri";
    const newContractUri = "newContractUri";

    await nft.changeBaseURI(newUri);
    await nft.changeBaseContractURI(newContractUri);

    const contractURI = await nft.contractURI();
    const tokenURI = await nft.tokenURI(555);

    expect(contractURI).to.eq(newContractUri);
    expect(tokenURI).to.eq(`${newUri}${555}.json`);

    await expect(nft.tokenURI(2222)).to.be.revertedWith(
      "ERC721: invalid token ID"
    );

    //reverts
    await expect(
      nft.connect(otherAccount).changeBaseURI(newUri)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      nft.connect(otherAccount).changeBaseContractURI(newContractUri)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("test random", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);
    const count = 500;
    await nft.changeStatus(1);

    const filter = {
      address: nft.address,
      topics: [
        // the name of the event, parnetheses containing the data type of each event, no spaces
        ethers.utils.id("Transfer(address,address,uint256)"),
      ],
    };

    const price = await nft.price();
    // 1 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });
    // 2 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });
    // 3 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });
    // 4 of 4
    await nft.safeMint(owner.address, count, {
      value: price.mul(count),
    });

    await expect(
      nft.safeMint(owner.address, 1, {
        value: price.mul(1),
      })
    ).to.be.revertedWith("No tokens left");
  });

  it("test refund", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);
    const count = 4;
    await nft.changeStatus(1);

    const price = await nft.price();

    const mint = await nft.safeMint(owner.address, count, {
      value: price.mul(count).add(8000000),
    });

    await expect(mint).to.changeEtherBalances(
      [owner.address, nft.address],
      [price.mul(-count), price.mul(count)]
    );
  });
});
