export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addBarcode' : IDL.Func([IDL.Text], [], []),
    'getScannedBarcodes' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
