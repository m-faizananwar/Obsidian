class VaultManager {
    constructor() {
        this.vaults = [];
        this.currentVault = null;
        this.loadVaults();
    }

    loadVaults() {
        this.vaults = JSON.parse(localStorage.getItem('dreamy-notes-vaults')) || [];
        if (this.vaults.length === 0) {
            this.createVault('Default Vault');
        }
        this.switchToVault(this.vaults[0].id);
    }

    createVault(name) {
        const vault = {
            id: 'vault_' + Date.now(),
            name,
            createdAt: Date.now(),
            tasks: [],
            lastModified: Date.now()
        };
        this.vaults.push(vault);
        this.saveVaults();
        return vault;
    }

    switchToVault(vaultId) {
        const vault = this.vaults.find(v => v.id === vaultId);
        if (!vault) return false;
        
        if (this.currentVault) {
            this.saveCurrentVaultData();
        }
        
        this.currentVault = vault;
        localStorage.setItem('currentVaultId', vaultId);
        this.loadVaultData(vault);
        return true;
    }

    saveCurrentVaultData() {
        if (!this.currentVault) return;
        this.currentVault.tasks = window.tasks || [];
        this.currentVault.lastModified = Date.now();
        this.saveVaults();
    }

    loadVaultData(vault) {
        window.tasks = vault.tasks || [];
        window.refreshTasks();
    }

    saveVaults() {
        localStorage.setItem('dreamy-notes-vaults', JSON.stringify(this.vaults));
    }

    deleteVault(vaultId) {
        if (this.vaults.length <= 1) return false;
        
        const index = this.vaults.findIndex(v => v.id === vaultId);
        if (index === -1) return false;
        
        this.vaults.splice(index, 1);
        this.saveVaults();
        
        if (this.currentVault?.id === vaultId) {
            this.switchToVault(this.vaults[0].id);
        }
        return true;
    }
}

window.vaultManager = new VaultManager();
