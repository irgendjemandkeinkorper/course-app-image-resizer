# IndexedDB history can fail after a successful export

History saves persist full source-image data URLs in IndexedDB. Browser quota or storage errors can occur after the export bytes have already been generated. Export status must remain successful while history-save failure is reported separately and non-blockingly.
