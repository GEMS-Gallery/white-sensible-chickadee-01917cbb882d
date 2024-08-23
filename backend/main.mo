import Array "mo:base/Array";
import Text "mo:base/Text";

actor {
  // Stable variable to store scanned barcodes
  stable var scannedBarcodes : [Text] = [];

  // Add a new barcode to the list
  public func addBarcode(code : Text) : async () {
    scannedBarcodes := Array.append(scannedBarcodes, [code]);
  };

  // Get all scanned barcodes
  public query func getScannedBarcodes() : async [Text] {
    scannedBarcodes
  };
}