Object.defineProperties(exports, {
  MONGO_URI: {
    get: function () {
      if (!process.env.TAKAFUL_MONGO_URI) {
        throw new Error('TAKAFUL_MONGO_URI env var must be set');
      }
      return process.env.TAKAFUL_MONGO_URI;
    }
  },
  PRINT_SRV: {
    get: function () {
      if (!process.env.TAKAFUL_PRINT_SRV) {
        throw new Error('TAKAFUL_PRINT_SRV env var must be set');
      }
      return process.env.TAKAFUL_PRINT_SRV;
    }
  },
  PRINT_PORT: {
    get: function () {
      if (!process.env.TAKAFUL_PRINT_PORT) {
        throw new Error('TAKAFUL_PRINT_PORT env var must be set');
      }
      return process.env.TAKAFUL_PRINT_PORT;
    }
  }
});
