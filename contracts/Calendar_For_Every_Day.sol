// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC721.sol";

contract Calendar_For_Every_Day is ERC721, Ownable {
    using Strings for uint256;

    uint16 internal _totalSupply;
    uint16 internal constant maxSupply = 10980;
    uint112 public price = 0.1 ether;
    uint112 public payout = 0.3 ether;

    string private baseURI =
        "https://gold-tough-wildebeest-794.mypinata.cloud/ipfs/Qmazuem1EbQ6rRsPEYFmDauc3Hb3NvPLCwxK93AGq6hB46/";
    string private baseContractURI =
        "https://gold-tough-wildebeest-794.mypinata.cloud/ipfs/QmeHZ6HixWVf3pwUWDgTsHPSSPRjYyXofcgcv5rYjRbou2";

    uint256[maxSupply] internal indices;

    mapping(address => uint) _receivers;

    enum Status {
        PAUSE,
        MINT
    }

    Status public status;

    constructor(
        address[200] memory receivers_
    ) ERC721("Calendar_For_Every_Day", "CFED") {
        for (uint i; i < 200; i++) {
            _receivers[receivers_[i]] = 1;
        }
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function safeMint(address to, uint256 quantity) external payable {
        _safeMint(to, quantity);
    }

    function _safeMint(address to, uint256 quantity) internal override {
        require(status != Status.PAUSE, "Mint paused");
        require(to != address(0), "ERC721: mint to the zero address");
        require(
            msg.value >= price * quantity || msg.sender == owner(),
            "Wrong amount"
        );
        require(_totalSupply + quantity <= maxSupply, "No tokens left");
        require(quantity != 0, "quantity must be greater than 0");

        _mint(to, quantity);

        require(
            _checkOnERC721Received(address(0), to, _totalSupply, ""),
            "ERC721: transfer to non ERC721Receiver implementer"
        );

        if (msg.value > price * quantity) {
            payable(msg.sender).transfer(msg.value - price * quantity);
        }
    }

    function _mint(address to, uint256 quantity) internal override {
        for (uint256 i; i < quantity; i++) {
            uint256 _id = _generateRandomId(i);
            require(!_exists(_id), "ERC721: token already minted");

            _owners[_id] = to;
            emit Transfer(address(0), to, _id);
        }

        unchecked {
            _balances[to] += quantity;
            _totalSupply += uint16(quantity);
        }
    }

    function _generateRandomId(uint256 i) private returns (uint256) {
        uint256 totalSupply_ = _totalSupply;
        uint256 totalSize = maxSupply - (totalSupply_ + i);
        uint256 index = uint256(
            keccak256(
                abi.encodePacked(
                    totalSupply_ + i,
                    msg.sender,
                    block.prevrandao,
                    block.timestamp
                )
            )
        ) % totalSize;
        uint256 value = 0;

        if (indices[index] != 0) {
            value = indices[index];
        } else {
            value = index;
        }

        // Move last value to selected position
        if (indices[totalSize - 1] == 0) {
            indices[index] = totalSize - 1; // Array position not initialized, so use position
        } else {
            indices[index] = indices[totalSize - 1]; // Array position holds a value so use that
        }
        // Don't allow a zero index, start counting at 1
        return value + 1;
    }

    function changePrice(uint112 _price) external onlyOwner {
        require(_price > 0, "Incorrect price");
        price = _price;
    }

    function changeBaseURI(string calldata newURI) public onlyOwner {
        baseURI = newURI;
    }

    function changeBaseContractURI(string calldata newURI) public onlyOwner {
        baseContractURI = newURI;
    }

    function changeStatus(Status _status) external onlyOwner {
        status = _status;
    }

    function contractURI() public view returns (string memory) {
        return baseContractURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721) returns (string memory) {
        _requireMinted(tokenId);

        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    function requestPayout() public {
        require(_totalSupply / _receivers[msg.sender] > 999, "Not yet");
        _receivers[msg.sender]++;

        getPayout();
    }

    function getPayout() private {
        address payable receiver = payable(msg.sender);
        receiver.transfer(payout);
    }

    function checkPayout() public view returns (bool) {
        return _totalSupply / _receivers[msg.sender] > 999;
    }

    function withdraw(uint amount) external onlyOwner {
        require(amount <= address(this).balance);
        address payable to = payable(msg.sender);
        to.transfer(amount);
    }
}
