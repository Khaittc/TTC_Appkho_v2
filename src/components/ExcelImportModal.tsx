import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, FileDown, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Item, Category, Brand, Unit } from '../types';
import { getDataProvider } from '../data/repositoryFactory';
import { normalizeModel, normalizeBrandName } from '../domain/item/itemUtils';
import { useNotification } from '../context/NotificationContext';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  units: Unit[];
  allItems: Item[];
}

export function ExcelImportModal({ isOpen, onClose, categories, brands, units, allItems }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState({ total: 0, valid: 0, error: 0, duplicate: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useNotification();
  const provider = getDataProvider();

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      'Nhóm hàng',
      'Hãng sản xuất',
      'Model',
      'Tên vật tư',
      'Đơn vị tính',
      'Loại vật tư',
      'Manufacturer Part Number',
      'Mô tả',
      'Tồn kho an toàn',
      'Datasheet URL',
      'Ghi chú kỹ thuật',
      'Trạng thái'
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, 'Item Import');
    
    const instructionWs = XLSX.utils.aoa_to_sheet([
      ['Trường', 'Bắt buộc', 'Mô tả'],
      ['Nhóm hàng', 'Có', 'Tên nhóm hàng (phải khớp với hệ thống)'],
      ['Hãng sản xuất', 'Có', 'Tên hãng (phải khớp với hệ thống hoặc aliases)'],
      ['Model', 'Có', 'Mã Model của nhà sản xuất'],
      ['Tên vật tư', 'Có', 'Tên hiển thị'],
      ['Đơn vị tính', 'Có', 'Tên đơn vị tính (phải khớp với hệ thống)'],
      ['Loại vật tư', 'Có', 'STANDARD | PROJECT_SPECIFIC | CONSUMABLE | SPARE_PART'],
      ['Trạng thái', 'Không', 'ACTIVE | INACTIVE (Mặc định: ACTIVE)'],
      ['Tồn kho an toàn', 'Không', 'Số (Mặc định: 0)'],
    ]);
    XLSX.utils.book_append_sheet(wb, instructionWs, 'Hướng dẫn');
    
    XLSX.writeFile(wb, 'TTC_Material_Hub_Item_Import_Template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    parseExcel(selectedFile);
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);
        validateData(rows);
      } catch (err) {
        error('File Excel không hợp lệ hoặc bị lỗi định dạng.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (rows: any[]) => {
    let validCount = 0;
    let errCount = 0;
    let dupCount = 0;
    
    const validatedRows = rows.map((row, index) => {
      const catName = String(row['Nhóm hàng'] || '').trim();
      const brandName = String(row['Hãng sản xuất'] || '').trim();
      const model = String(row['Model'] || '').trim();
      const name = String(row['Tên vật tư'] || '').trim();
      const unitName = String(row['Đơn vị tính'] || '').trim();
      const itemType = String(row['Loại vật tư'] || '').trim();
      const mfgPart = String(row['Manufacturer Part Number'] || '').trim();
      const desc = String(row['Mô tả'] || '').trim();
      const safety = parseFloat(row['Tồn kho an toàn']);
      const dsUrl = String(row['Datasheet URL'] || '').trim();
      const note = String(row['Ghi chú kỹ thuật'] || '').trim();
      const statusRaw = String(row['Trạng thái'] || 'ACTIVE').trim().toUpperCase();

      let rowStatus = 'VALID';
      const errors: string[] = [];

      // Validate required
      if (!catName || !brandName || !model || !name || !unitName || !itemType) {
        errors.push('Thiếu trường bắt buộc');
      }

      // Validate references
      const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
      if (!cat) errors.push('Nhóm hàng không tồn tại');

      const brand = brands.find(b => 
        b.name.toLowerCase() === brandName.toLowerCase() || 
        b.aliases.some(a => a.toLowerCase() === brandName.toLowerCase()) ||
        b.code.toLowerCase() === brandName.toLowerCase()
      );
      if (!brand) errors.push('Hãng sản xuất không tồn tại');

      const unit = units.find(u => u.name.toLowerCase() === unitName.toLowerCase());
      if (!unit) errors.push('Đơn vị tính không tồn tại');

      if (!['STANDARD', 'PROJECT_SPECIFIC', 'CONSUMABLE', 'SPARE_PART'].includes(itemType)) {
        errors.push('Loại vật tư không hợp lệ');
      }

      const status = ['ACTIVE', 'INACTIVE'].includes(statusRaw) ? statusRaw as 'ACTIVE' | 'INACTIVE' : 'ACTIVE';
      const safetyStock = !isNaN(safety) && safety >= 0 ? safety : 0;

      // Duplicate Check (Brand + Model)
      const normalizedModel = normalizeModel(model);
      if (brand && model) {
        const isDuplicateDB = allItems.some(i => i.brandId === brand.id && i.modelNormalized === normalizedModel);
        // Also check if duplicate within the current file rows before this index
        const isDuplicateFile = rows.findIndex((r, idx) => {
          if (idx >= index) return false;
          const rBrand = String(r['Hãng sản xuất'] || '').trim();
          const rModel = normalizeModel(String(r['Model'] || '').trim());
          const rb = brands.find(b => b.name.toLowerCase() === rBrand.toLowerCase() || b.aliases.some(a => a.toLowerCase() === rBrand.toLowerCase()));
          return rb && rb.id === brand.id && rModel === normalizedModel;
        }) !== -1;

        if (isDuplicateDB || isDuplicateFile) {
          rowStatus = 'DUPLICATE';
          errors.push('Trùng Hãng + Model');
        }
      }

      if (errors.length > 0 && rowStatus !== 'DUPLICATE') {
        rowStatus = 'ERROR';
      }

      if (rowStatus === 'VALID') validCount++;
      if (rowStatus === 'ERROR') errCount++;
      if (rowStatus === 'DUPLICATE') dupCount++;

      return {
        rowNum: index + 2, // 1-based, plus header
        catName,
        catId: cat?.id,
        brandName,
        brandId: brand?.id,
        model,
        name,
        unitName,
        unitId: unit?.id,
        itemType,
        mfgPart,
        desc,
        safetyStock,
        dsUrl,
        note,
        status,
        rowStatus,
        errorMsg: errors.join(', ')
      };
    });

    setImportSummary({ total: validatedRows.length, valid: validCount, error: errCount, duplicate: dupCount });
    setPreviewData(validatedRows);
  };

  const handleImport = async () => {
    const validRows = previewData.filter(r => r.rowStatus === 'VALID');
    if (validRows.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    try {
      for (const row of validRows) {
        await provider.addItem({
          model: row.model,
          modelNormalized: normalizeModel(row.model),
          brandId: row.brandId,
          brandName: brands.find(b => b.id === row.brandId)?.name || '',
          name: row.name,
          categoryId: row.catId,
          categoryName: categories.find(c => c.id === row.catId)?.name || '',
          unitId: row.unitId,
          unitName: units.find(u => u.id === row.unitId)?.name || '',
          itemType: row.itemType,
          currentStock: 0,
          safetyStock: row.safetyStock,
          description: row.desc,
          manufacturerPartNumber: row.mfgPart,
          datasheetUrl: row.dsUrl,
          technicalNote: row.note,
          status: row.status,
          source: 'IMPORT',
          createdAt: new Date().toISOString(),
          createdBy: 'system_import',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system_import'
        });
        successCount++;
      }
      success(`Import thành công ${successCount} vật tư.`);
      const skipped = previewData.length - successCount;
      if (skipped > 0) {
        error(`${skipped} dòng không được import.`);
      }
      onClose();
    } catch (err) {
      error('Có lỗi xảy ra trong quá trình import.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setImportSummary({ total: 0, valid: 0, error: 0, duplicate: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-6xl bg-white max-h-[90vh] flex flex-col shadow-2xl rounded-xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Import vật tư từ Excel</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Đóng"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
          {!file ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-white p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Tải lên file Excel</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md">Kéo thả file .xlsx vào đây hoặc bấm nút chọn file để import dữ liệu vật tư hàng loạt vào hệ thống.</p>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Tải file mẫu
                </button>
                
                <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4" />
                  Chọn file
                  <input type="file" accept=".xlsx" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{file.name}</h3>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button type="button" onClick={resetState} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Chọn file khác</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                  <div className="text-2xl font-bold text-slate-800">{importSummary.total}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Tổng dòng</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                  <div className="text-2xl font-bold text-green-600">{importSummary.valid}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Hợp lệ</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                  <div className="text-2xl font-bold text-red-600">{importSummary.error}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Lỗi</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                  <div className="text-2xl font-bold text-yellow-600">{importSummary.duplicate}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Trùng Hãng+Model</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-medium">Dòng</th>
                        <th className="px-4 py-3 font-medium">Trạng thái</th>
                        <th className="px-4 py-3 font-medium">Lỗi</th>
                        <th className="px-4 py-3 font-medium">Nhóm hàng</th>
                        <th className="px-4 py-3 font-medium">Hãng</th>
                        <th className="px-4 py-3 font-medium">Model</th>
                        <th className="px-4 py-3 font-medium">Tên vật tư</th>
                        <th className="px-4 py-3 font-medium">Đơn vị</th>
                        <th className="px-4 py-3 font-medium">Loại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {previewData.map((row, i) => (
                        <tr key={i} className={cn("hover:bg-slate-50", row.rowStatus !== 'VALID' && 'bg-red-50 hover:bg-red-50')}>
                          <td className="px-4 py-3 font-medium">{row.rowNum}</td>
                          <td className="px-4 py-3">
                            {row.rowStatus === 'VALID' ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium"><CheckCircle2 className="w-4 h-4"/> Hợp lệ</span>
                            ) : row.rowStatus === 'DUPLICATE' ? (
                              <span className="inline-flex items-center gap-1 text-yellow-600 font-medium"><AlertTriangle className="w-4 h-4"/> Trùng lặp</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium"><AlertCircle className="w-4 h-4"/> Lỗi</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-red-600 text-xs whitespace-normal min-w-[200px]">{row.errorMsg}</td>
                          <td className="px-4 py-3">{row.catName}</td>
                          <td className="px-4 py-3">{row.brandName}</td>
                          <td className="px-4 py-3 font-medium">{row.model}</td>
                          <td className="px-4 py-3">{row.name}</td>
                          <td className="px-4 py-3">{row.unitName}</td>
                          <td className="px-4 py-3">{row.itemType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-2 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            Đóng
          </button>
          <button 
            type="button"
            onClick={handleImport}
            disabled={!file || importSummary.valid === 0 || isProcessing}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xs"
          >
            {isProcessing ? 'Đang import...' : `Import ${importSummary.valid} vật tư hợp lệ`}
          </button>
        </div>
      </div>
    </div>
  );
}
