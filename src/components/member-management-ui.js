// ============================================================
// MEMBER MANAGEMENT UI FOR MEETING SYSTEM
// Add to meeting system to view and select members
// ============================================================

// ============================================================
// MEMBER LIST COMPONENT
// ============================================================
class MemberList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.members = [];
    this.filteredMembers = [];
    this.selectedMembers = new Set();
  }

  // Load members from Supabase
  async loadMembers() {
    try {
      const { data, error } = await supabase
        .from('AHLI DPMM JOHOR')
        .select('NO_AHLI, NAMA_AHLI, DAERAH, STATUS')
        .eq('STATUS', 'AKTIF')
        .order('NAMA_AHLI');

      if (error) throw error;

      this.members = data;
      this.filteredMembers = data;
      this.render();
    } catch (error) {
      console.error('Failed to load members:', error);
      blastErrorUI.showError(error, 'Gagal memuatkan senarai ahli');
    }
  }

  // Filter members
  filterMembers(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredMembers = this.members.filter(member =>
      member.NAMA_AHLI.toLowerCase().includes(lowerQuery) ||
      member.NO_AHLI.toLowerCase().includes(lowerQuery) ||
      (member.DAERAH && member.DAERAH.toLowerCase().includes(lowerQuery))
    );
    this.render();
  }

  // Toggle member selection
  toggleMember(memberId) {
    if (this.selectedMembers.has(memberId)) {
      this.selectedMembers.delete(memberId);
    } else {
      this.selectedMembers.add(memberId);
    }
    this.render();
  }

  // Get selected members
  getSelectedMembers() {
    return Array.from(this.selectedMembers);
  }

  // Clear selection
  clearSelection() {
    this.selectedMembers.clear();
    this.render();
  }

  // Render member list
  render() {
    if (!this.container) return;

    const html = `
      <div class="member-list">
        <div class="member-list-header">
          <h3>Senarai Ahli</h3>
          <input 
            type="text" 
            placeholder="Cari ahli..." 
            class="member-search"
            oninput="memberList.filterMembers(this.value)"
          />
          <div class="member-count">
            ${this.filteredMembers.length} ahli dipilih: ${this.selectedMembers.size}
          </div>
        </div>
        <div class="member-list-body">
          ${this.filteredMembers.map(member => this.renderMember(member)).join('')}
        </div>
        <div class="member-list-footer">
          <button onclick="memberList.clearSelection()" class="btn-secondary">
            Kosongkan Pilihan
          </button>
          <button onclick="memberList.confirmSelection()" class="btn-primary">
            Sahkan Pilihan (${this.selectedMembers.size})
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // Render single member
  renderMember(member) {
    const isSelected = this.selectedMembers.has(member.NO_AHLI);
    return `
      <div class="member-item ${isSelected ? 'selected' : ''}" onclick="memberList.toggleMember('${member.NO_AHLI}')">
        <div class="member-checkbox">
          <input type="checkbox" ${isSelected ? 'checked' : ''} />
        </div>
        <div class="member-info">
          <div class="member-name">${member.NAMA_AHLI}</div>
          <div class="member-id">${member.NO_AHLI}</div>
          ${member.DAERAH ? `<div class="member-district">${member.DAERAH}</div>` : ''}
        </div>
      </div>
    `;
  }

  // Confirm selection
  confirmSelection() {
    const selected = this.getSelectedMembers();
    if (selected.length === 0) {
      alert('Sila pilih sekurang-kurangnya seorang ahli');
      return;
    }

    // Trigger custom event with selected members
    const event = new CustomEvent('membersSelected', { detail: selected });
    document.dispatchEvent(event);
  }
}

// ============================================================
// MEMBER DETAIL VIEW
// ============================================================
class MemberDetailView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  // Show member details
  async showMember(memberId) {
    try {
      const { data, error } = await supabase
        .from('AHLI DPMM JOHOR')
        .select('*')
        .eq('NO_AHLI', memberId)
        .single();

      if (error) throw error;

      this.render(data);
    } catch (error) {
      console.error('Failed to load member:', error);
      blastErrorUI.showError(error, 'Gagal memuatkan maklumat ahli');
    }
  }

  // Render member details
  render(member) {
    if (!this.container) return;

    const html = `
      <div class="member-detail">
        <div class="member-detail-header">
          <h3>Maklumat Ahli</h3>
          <button onclick="memberDetailView.close()" class="btn-close">✕</button>
        </div>
        <div class="member-detail-body">
          <div class="detail-row">
            <span class="detail-label">ID Ahli:</span>
            <span class="detail-value">${member.NO_AHLI}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nama:</span>
            <span class="detail-value">${member.NAMA_AHLI}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Daerah:</span>
            <span class="detail-value">${member.DAERAH || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value ${member.STATUS === 'AKTIF' ? 'status-active' : 'status-inactive'}">
              ${member.STATUS}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tarikh Lantik:</span>
            <span class="detail-value">${formatDate(member.TARIKH_LANTIK)}</span>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // Close detail view
  close() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
