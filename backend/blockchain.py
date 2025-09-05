import hashlib
import datetime
import json

class Block:
    """Represents a single block in the blockchain"""
    
    def __init__(self, index, certificate_data, previous_hash):
        """Initialize a new block"""
        self.index = index
        self.timestamp = datetime.datetime.utcnow().isoformat()
        self.certificate_data = certificate_data
        self.previous_hash = previous_hash
        self.hash = self.compute_hash()

    def compute_hash(self):
        """Compute SHA-256 hash of the block"""
        # Convert certificate_data to JSON string for consistent hashing
        data_string = json.dumps(self.certificate_data, sort_keys=True)
        block_string = f"{self.index}{self.timestamp}{data_string}{self.previous_hash}"
        return hashlib.sha256(block_string.encode()).hexdigest()

    def to_dict(self):
        """Convert block to dictionary for JSON serialization"""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'certificate_data': self.certificate_data,
            'previous_hash': self.previous_hash,
            'hash': self.hash
        }

class Blockchain:
    """Blockchain implementation for certificate verification"""
    
    def __init__(self):
        """Initialize blockchain with genesis block"""
        self.chain = []
        self.create_genesis_block()

    def create_genesis_block(self):
        """Create the first block in the chain"""
        genesis_data = {
            "certificate_id": "GENESIS",
            "student_name": "Genesis Block",
            "degree": "System Genesis",
            "issue_date": datetime.datetime.utcnow().strftime("%Y-%m-%d")
        }
        genesis_block = Block(0, genesis_data, "0")
        self.chain.append(genesis_block)

    def get_latest_block(self):
        """Get the most recent block in the chain"""
        return self.chain[-1]

    def add_block(self, certificate_data):
        """Add a new certificate block to the chain"""
        previous_block = self.get_latest_block()
        new_block = Block(len(self.chain), certificate_data, previous_block.hash)
        self.chain.append(new_block)
        return new_block

    def is_chain_valid(self):
        """Validate the integrity of the blockchain"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
            
            # Check if current block's hash is valid
            if current_block.hash != current_block.compute_hash():
                return False
            
            # Check if current block points to previous block
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True

    def find_certificate(self, certificate_id):
        """Find a certificate by its ID in the blockchain"""
        for block in self.chain:
            if block.certificate_data.get("certificate_id") == certificate_id:
                return block
        return None

    def get_all_certificates(self):
        """Get all certificates from the blockchain (excluding genesis)"""
        certificates = []
        for block in self.chain[1:]:  # Skip genesis block
            certificates.append(block.certificate_data)
        return certificates

    def get_chain_summary(self):
        """Get summary of the blockchain"""
        return {
            'total_blocks': len(self.chain),
            'total_certificates': len(self.chain) - 1,  # Exclude genesis
            'is_valid': self.is_chain_valid(),
            'latest_block_hash': self.get_latest_block().hash
        }
