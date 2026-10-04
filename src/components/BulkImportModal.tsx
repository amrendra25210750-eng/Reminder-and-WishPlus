import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download, HelpCircle } from 'lucide-react';
import { Celebrant, OccasionType, RelationshipType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportCelebrants: (celebrants: Celebrant[], mode: 'append' | 'replace') => void;
}

export const BulkImportModal: React.FC<Props> = ({ isOpen, onClose, onImportCelebrants }) => {
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedPreview, setParsedPreview] = useState<Celebrant[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleCsvData = `Name,Occasion,Date,Phone,Relationship,Years,Notes
Tanvi Deshmukh,Birthday,2026-10-08,+919876543299,Friend,27,Coffee enthusiast & photographer
Rishi & Meera,Anniversary,2026-10-15,+919823456711,Colleague,8,Met at design agency
Uncle Ramesh,Birthday,2026-10-20,+919811223344,Family,60,Enjoys gardening
Sarah & John Connor,Anniversary,2026-11-04,+14155550199,Client,12,Annual software partners`;

  /**
   * Normalize date strings like "08/10/2026", "15-10-1996", "2026-10-08", etc.
   */
  const normalizeDate = (raw: string): string => {
    if (!raw) return new Date().toISOString().split('T')[0];
    const clean = raw.trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }

    // MM-DD or MM/DD
    const md = clean.match(/^(\d{1,2})[/-](\d{1,2})$/);
    if (md) {
      const year = new Date().getFullYear();
      const month = md[1].padStart(2, '0');
      const day = md[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return clean;
  };

  const parseData = (raw: string) => {
    setParseError(null);
    if (!raw.trim()) {
      setParsedPreview([]);
      return;
    }

    try {
      // Check if JSON
      if (raw.trim().startsWith('[') || raw.trim().startsWith('{')) {
        const jsonData = JSON.parse(raw);
        const list = Array.isArray(jsonData) ? jsonData : [jsonData];
        const valid: Celebrant[] = list.map((item, idx) => ({
          id: `imported-${Date.now()}-${idx}`,
          name: item.name || item.fullName || item.celebrant || 'Unnamed',
          phone: item.phone || item.mobile || item.whatsapp || '',
          countryCode: item.countryCode || '+91',
          occasion: String(item.occasion || item.type || item.event).toLowerCase().includes('anniv') ? 'anniversary' : 'birthday',
          date: normalizeDate(item.date || item.dob || item.anniversaryDate),
          relationship: item.relationship || item.relation || 'Friend',
          years: item.years || item.age ? parseInt(item.years || item.age, 10) : undefined,
          notes: item.notes || item.remarks || '',
          status: 'pending',
          lastWishedAt: null,
        }));
        setParsedPreview(valid);
        return;
      }

      // Parse CSV / TSV / Excel Copy-Paste
      const lines = raw.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length === 0) {
        setParsedPreview([]);
        return;
      }

      // Detect separator: Tab (from Excel/Sheets) or comma or semicolon
      let separator = ',';
      if (lines[0].includes('\t')) separator = '\t';
      else if (lines[0].includes(';') && !lines[0].includes(',')) separator = ';';

      const splitLine = (l: string) => {
        if (separator === '\t') return l.split('\t').map((s) => s.trim());
        // CSV with quote awareness
        const matches: string[] = [];
        const regex = /(?:,|\t|;|^)("(?:(?:"")*[^"]*)*"|[^,;\t]*)/g;
        let match;
        while ((match = regex.exec(l)) !== null) {
          let col = match[1] || '';
          if (col.startsWith('"') && col.endsWith('"')) {
            col = col.substring(1, col.length - 1).replace(/""/g, '"');
          }
          matches.push(col.trim());
        }
        return matches;
      };

      const firstRow = splitLine(lines[0]);
      let colName = 0;
      let colOccasion = 1;
      let colDate = 2;
      let colPhone = 3;
      let colRel = 4;
      let colYears = 5;
      let colNotes = 6;

      const firstRowLower = firstRow.map((c) => c.toLowerCase());
      const hasHeader = firstRowLower.some((h) =>
        ['name', 'celebrant', 'person', 'occasion', 'event', 'date', 'dob', 'phone', 'mobile'].includes(h)
      );

      if (hasHeader) {
        firstRowLower.forEach((h, idx) => {
          if (h.includes('name') || h.includes('celebrant') || h.includes('person') || h.includes('recipient')) colName = idx;
          else if (h.includes('occasion') || h.includes('type') || h.includes('event')) colOccasion = idx;
          else if (h.includes('date') || h.includes('dob') || h.includes('anniv') || h.includes('birthday')) colDate = idx;
          else if (h.includes('phone') || h.includes('mobile') || h.includes('whatsapp') || h.includes('number') || h.includes('contact')) colPhone = idx;
          else if (h.includes('relation') || h.includes('category') || h.includes('group')) colRel = idx;
          else if (h.includes('year') || h.includes('age') || h.includes('milestone')) colYears = idx;
          else if (h.includes('note') || h.includes('remark') || h.includes('interest') || h.includes('comment')) colNotes = idx;
        });
      }

      const dataLines = hasHeader ? lines.slice(1) : lines;
      const validList: Celebrant[] = [];

      dataLines.forEach((line, index) => {
        const cols = splitLine(line);
        if (cols.length >= 2 && cols[colName]) {
          const name = cols[colName];
          const rawOccasion = (cols[colOccasion] || '').toLowerCase();
          const occasion: OccasionType = rawOccasion.includes('anniv') ? 'anniversary' : 'birthday';
          const rawDate = cols[colDate] || '';
          const date = normalizeDate(rawDate);
          const rawPhone = cols[colPhone] || '';
          const relationship = (cols[colRel] as RelationshipType) || 'Friend';
          const years = cols[colYears] ? parseInt(cols[colYears], 10) : undefined;
          const notes = cols[colNotes] || '';

          validList.push({
            id: `imported-${Date.now()}-${index}`,
            name,
            phone: rawPhone,
            countryCode: rawPhone.startsWith('+') ? '' : '+91',
            occasion,
            date,
            relationship: relationship || 'Friend',
            years: isNaN(years as number) ? undefined : years,
            notes,
            status: 'pending',
            lastWishedAt: null,
          });
        }
      });

      if (validList.length === 0) {
        setParseError('Could not recognize data rows. Please ensure your rows have Name, Occasion (Birthday/Anniversary), Date, and Phone.');
      }

      setParsedPreview(validList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setParseError('Parsing error: ' + msg);
      setParsedPreview([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      parseData(text);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (parsedPreview.length === 0) return;
    onImportCelebrants(parsedPreview, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Import Celebrations Data</h3>
              <p className="text-xs text-slate-400">Import your birthdays and anniversaries from Excel, CSV, or paste directly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 text-xs">
          {/* File input and Sample load */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-emerald-400 transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Upload .csv, .txt, or .json file</span>
              <input
                type="file"
                accept=".csv,.txt,.json,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setImportText(sampleCsvData);
                parseData(sampleCsvData);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700"
            >
              Fill Example Data
            </button>
          </div>

          {/* Paste Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">
                Paste Data (from Excel, Google Sheets, or CSV):
              </label>
              <span className="text-[11px] text-slate-400">Auto-detects columns & dates</span>
            </div>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                parseData(e.target.value);
              }}
              placeholder={`Name\tOccasion\tDate\tPhone\tRelationship\nRahul Sharma\tBirthday\t2026-10-10\t+919876543210\tFriend\nPooja & Ankit\tAnniversary\t2026-10-18\t+919812345678\tFamily`}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Error display */}
          {parseError && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Preview ({parsedPreview.length} valid celebration records)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Action:</span>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as 'append' | 'replace')}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="append">Add to current list</option>
                    <option value="replace">Replace whole list</option>
                  </select>
                </div>
              </div>

              <div className="max-h-44 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950/70">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-1.5 px-3">Name</th>
                      <th className="py-1.5 px-2">Occasion</th>
                      <th className="py-1.5 px-2">Date</th>
                      <th className="py-1.5 px-2">Phone</th>
                      <th className="py-1.5 px-2">Relationship</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="py-1.5 px-3 font-medium text-slate-200">{item.name}</td>
                        <td className="py-1.5 px-2 capitalize">{item.occasion}</td>
                        <td className="py-1.5 px-2 font-mono-nums">{item.date}</td>
                        <td className="py-1.5 px-2 font-mono-nums">{item.phone}</td>
                        <td className="py-1.5 px-2">{item.relationship}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleApplyImport}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Import {parsedPreview.length > 0 ? `${parsedPreview.length} Celebrants` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
