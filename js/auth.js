/**
 * Authentication & Session Management Module for Sabor & Gestão
 */

const SESSION_KEY = 'sabor_gestao_session';

const AuthManager = {
  getCurrentUser() {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch (e) {
      this.logout();
      return null;
    }
  },

  loginMesa(login, senha) {
    const db = StorageManager.getDB();
    const user = db.usuarios.find(u =>
      u.tipo === 'mesa' &&
      u.ativo &&
      u.login.trim().toLowerCase() === login.trim().toLowerCase() &&
      u.senha === senha
    );

    if (!user) {
      throw new Error("Credenciais de mesa inválidas ou conta inativa.");
    }

    const session = {
      id: user.id,
      tipo: user.tipo,
      nome: user.nome,
      login: user.login,
      perfil: null
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  loginFuncionario(login, senha, perfilDesejado = null) {
    const db = StorageManager.getDB();
    const user = db.usuarios.find(u =>
      u.tipo === 'funcionario' &&
      u.ativo &&
      u.login.trim().toLowerCase() === login.trim().toLowerCase() &&
      u.senha === senha
    );

    if (!user) {
      throw new Error("Credenciais de funcionário inválidas ou conta inativa.");
    }

    if (perfilDesejado && user.perfil !== perfilDesejado && user.perfil !== 'Gerente') {
      throw new Error(`Seu perfil (${user.perfil}) não possui acesso a esta área.`);
    }

    const session = {
      id: user.id,
      tipo: user.tipo,
      nome: user.nome,
      login: user.login,
      perfil: user.perfil
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  hasRole(roleRequired) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    if (currentUser.perfil === 'Gerente') return true; // Gerente has full access
    return currentUser.perfil === roleRequired;
  },

  isMesa() {
    const currentUser = this.getCurrentUser();
    return currentUser && currentUser.tipo === 'mesa';
  }
};
