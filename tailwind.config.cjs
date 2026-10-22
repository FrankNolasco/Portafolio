module.exports = {
  content: ['./index.html', './proyectos.html', './js/*.js'],
  theme: {
    extend: {
      colors: {
        page: 'var(--page)', surface: 'var(--surface)', ink: 'var(--text)',
        accent: 'var(--accent)', muted: 'var(--muted)', line: 'var(--line)'
      },
      fontFamily: { sans: ['system-ui', 'sans-serif'] }
    }
  }
};
