export interface ParsedAddress {
    name?: string;
    email?: string;
    raw: string;
  }
  
  export interface ParsedForwardedEmail {
    originalHeaders: {
      from?: ParsedAddress;
      to?: ParsedAddress[];
      cc?: ParsedAddress[];
      date?: string;
      subject?: string;
      // All headers as a map (lowercased keys)
      all: Record<string, string>;
    };
    originalBody: string;   // Text after the forwarded headers
    remainder: string;      // Text outside the forwarded block (before it, typically)
  }
  
  const FORWARD_MARKERS: RegExp[] = [
    // Common English
    /^[-\s]*forwarded message[-\s]*$/im,
    /^begin forwarded message:?$/im,
    /^[-]{2,}\s*forwarded message\s*[-]{2,}\s*$/im,
    // Norwegian (Bokmål) common phrasings
    /^[-\s]*videresendt melding[-\s]*$/im,
    /^begynn videresendt melding:?$/im, // Apple-style localized guess
  ];
  
  const HEADER_ALIASES: Record<string, string[]> = {
    from:     ['from', 'fra'],
    to:       ['to', 'til'],
    cc:       ['cc', 'kopi'],
    date:     ['date', 'dato', 'sendt'],
    subject:  ['subject', 'emne'],
  };
  
  const ADDRESS_REGEX = /<?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})>?/i;
  
  function normalizeHeaderKey(key: string): string {
    const lower = key.trim().toLowerCase();
    for (const canonical in HEADER_ALIASES) {
      if (HEADER_ALIASES[canonical].includes(lower)) return canonical;
    }
    return lower; // keep unknown headers too
  }
  
  function parseAddressList(raw: string): ParsedAddress[] {
    // Split on commas that separate recipients; be lenient
    const parts = raw.split(/,(?![^<]*>)/).map(s => s.trim()).filter(Boolean);
    return parts.map(rawPart => {
      // Try `<email>` first
      const angleMatch = rawPart.match(/^(.*?)<([^>]+)>$/);
      if (angleMatch) {
        const name = angleMatch[1].trim().replace(/^"|"$/g, '') || undefined;
        const email = angleMatch[2].trim();
        return { name, email, raw: rawPart };
      }
      // Fallback: bare email anywhere
      const m = rawPart.match(ADDRESS_REGEX);
      if (m) {
        // If there’s extra, treat as name
        const name = rawPart.replace(m[0], '').trim().replace(/^"|"$/g, '') || undefined;
        return { name, email: m[1], raw: rawPart };
      }
      return { raw: rawPart };
    });
  }
  
  function firstIndexOfAny(patterns: RegExp[], text: string): number {
    let best = -1;
    for (const re of patterns) {
      const m = re.exec(text);
      if (m && (best === -1 || m.index < best)) best = m.index;
    }
    return best;
  }
  
  /**
   * Parse the original headers + body from a forwarded email block.
   * Returns null if no forwarded block is found.
   */
  export function parseForwardedMessage(body: string): ParsedForwardedEmail | null {
    // Find the start of the forwarded block by markers OR by the first "From:"-like header line
    let start = firstIndexOfAny(FORWARD_MARKERS, body);
  
    // If no explicit marker, try to find a header cluster starting with From/Fra at beginning of a line
    if (start === -1) {
      const hdrStart = body.search(/^(from|fra):\s*/im);
      if (hdrStart !== -1) start = hdrStart;
    }
    if (start === -1) return null;
  
    const remainder = body.slice(0, start).trimEnd();
    const forwardedSection = body.slice(start);
  
    // Collect header lines until the first blank line
    const lines = forwardedSection.split(/\r?\n/);
    let i = 0;
  
    // Skip the marker line, if present
    if (FORWARD_MARKERS.some(re => re.test(lines[i] ?? ''))) {
      i++;
    }
  
    // Gather headers (including folded/continued lines)
    const headerLines: string[] = [];
    for (; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) { i++; break; } // blank line ends headers
      headerLines.push(line);
    }
  
    // Concatenate folded headers: lines starting with space/tab continue previous header
    const unfolded: string[] = [];
    for (const line of headerLines) {
      if (/^[ \t]/.test(line) && unfolded.length) {
        unfolded[unfolded.length - 1] += ' ' + line.trim();
      } else {
        unfolded.push(line);
      }
    }
  
    // Parse headers into map
    const allHeaders: Record<string, string> = {};
    for (const h of unfolded) {
      const m = h.match(/^([^:]+):\s*(.*)$/);
      if (!m) continue;
      const key = normalizeHeaderKey(m[1]);
      const val = m[2].trim();
      // Keep first occurrence; if repeated, append
      allHeaders[key] = allHeaders[key] ? `${allHeaders[key]}, ${val}` : val;
    }
  
    // Canonical fields
    const fromVal = allHeaders['from'];
    const toVal   = allHeaders['to'];
    const ccVal   = allHeaders['cc'];
    const dateVal = allHeaders['date'];
    const subVal  = allHeaders['subject'];
  
    const originalHeaders: ParsedForwardedEmail['originalHeaders'] = {
      from: fromVal ? parseAddressList(fromVal)[0] : undefined,
      to:   toVal ? parseAddressList(toVal) : undefined,
      cc:   ccVal ? parseAddressList(ccVal) : undefined,
      date: dateVal,
      subject: subVal,
      all: allHeaders,
    };
  
    // The rest is the original body until end or until another forwarded block (nesting)
    const rest = lines.slice(i).join('\n');
    const nextForwardIdx = firstIndexOfAny(FORWARD_MARKERS, rest);
    const originalBody = (nextForwardIdx === -1 ? rest : rest.slice(0, nextForwardIdx)).trim();
  
    return { originalHeaders, originalBody, remainder };
  }