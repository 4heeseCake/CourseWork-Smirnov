function createCommentRepository() {
  const records = { vulnerable: [], protected: [] };
  return {
    list: (mode) => records[mode],
    add(mode, text) {
      if (records[mode].length >= 200) return null;
      const comment = { id: records[mode].length + 1, text };
      records[mode].push(comment);
      return comment;
    },
  };
}
module.exports = { createCommentRepository };
