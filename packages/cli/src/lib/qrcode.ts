import QRCode from "qrcode"
import { QRCodeFileType } from "../../types/index.js"

/**
 *
 * @param filePath <string> - the path of the file where the QR Code will be stored.
 * @param key <string> - the key to be converted to a QR Code.
 * @param type <QRCodeFileType> - the different type of files where is possible to store the QR Code.
 */
// eslint-disable-next-line arrow-body-style
export default (filePath: string, key: string, type: QRCodeFileType): Promise<any> => {
  // NOTE: return Promise to close loose threads.
  return QRCode.toFile(`${filePath}.${type}`, key, {
    type,
    // 'H' can resist the damage to symbol by ~30%.
    errorCorrectionLevel: "H"
  })
}
