/**
 * VaultManager.js
 * Manages task vaults (containers for related tasks) using localStorage.
 */

export default class VaultManager {
  constructor() {
    this.vaults = [];
    this.currentVault = null;
    this.onVaultSwitch = null; // Callback for when vault changes
  }

  init() {
    this.loadVaults();
  }

  loadVaults() {
    const savedVaults = localStorage.getItem('dreamy-notes-vaults');
    this.vaults = savedVaults ? JSON.parse(savedVaults) : [];

    if (this.vaults.length === 0) {
      this.createVault('Default Vault');
    } else {
      const lastVaultId = localStorage.getItem('currentVaultId');
      this.switchToVault(lastVaultId || this.vaults[0].id);
    }
  }

  createVault(name) {
    const vault = {
      id: 'vault_' + Date.now(),
      name,
      createdAt: Date.now(),
      tasks: [],
      lastModified: Date.now(),
    };
    this.vaults.push(vault);
    this.saveVaults();
    return vault;
  }

  switchToVault(vaultId) {
    const vault = this.vaults.find((v) => v.id === vaultId);
    if (!vault) return false;

    if (this.currentVault) {
      this.saveCurrentVaultData();
    }

    this.currentVault = vault;
    localStorage.setItem('currentVaultId', vaultId);

    if (this.onVaultSwitch) {
      this.onVaultSwitch(vault);
    }

    return true;
  }

  saveCurrentVaultData() {
    if (!this.currentVault) return;
    // Window.tasks is used for backward compatibility with global state
    // In a fully modular app, this should be passed in
    this.currentVault.tasks = window.tasks || [];
    this.currentVault.lastModified = Date.now();
    this.saveVaults();
  }

  saveVaults() {
    localStorage.setItem('dreamy-notes-vaults', JSON.stringify(this.vaults));
  }

  deleteVault(vaultId) {
    if (this.vaults.length <= 1) return false;

    const index = this.vaults.findIndex((v) => v.id === vaultId);
    if (index === -1) return false;

    this.vaults.splice(index, 1);
    this.saveVaults();

    if (this.currentVault?.id === vaultId) {
      this.switchToVault(this.vaults[0].id);
    }
    return true;
  }
}
