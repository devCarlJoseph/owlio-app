import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
spec = json.loads((root.parent / 'owlio-api/docs/openapi.json').read_text(encoding='utf-8'))

def schema(s):
    if 'const' in s:
        return 'z.literal(' + json.dumps(s['const']) + ')'
    if 'enum' in s:
        return 'z.enum(' + json.dumps(s['enum']) + ')'
    alternatives = s.get('anyOf', s.get('oneOf'))
    if alternatives:
        return 'z.union([' + ','.join(schema(x) for x in alternatives) + '])'
    t = s.get('type')
    if t == 'object':
        required = s.get('required', [])
        # Responses with incomplete OpenAPI projections retain extra safe fields.
        return 'z.object({' + ','.join(json.dumps(k)+':'+schema(v)+('' if k in required else '.optional()') for k,v in s.get('properties',{}).items()) + '}).passthrough()'
    if t == 'array':
        return 'z.array(' + schema(s.get('items',{})) + ')'
    if t == 'null': return 'z.null()'
    if t == 'boolean': return 'z.boolean()'
    if t in ('number','integer'): return 'z.number()' + ('.int()' if t == 'integer' else '')
    if t == 'string': return 'z.string()'
    return 'z.unknown()'

lines = ["// Generated from owlio-api/docs/openapi.json. Regenerate with scripts/sync-api-contract.py.", "import { z } from 'zod'", '', 'export const operations = {']
for path, ops in spec['paths'].items():
    if not path.startswith('/api/v1/'): continue
    for method, op in ops.items():
        if method not in ('get','post','put','patch','delete'): continue
        body = op.get('requestBody',{}).get('content',{}).get('application/json',{}).get('schema',{})
        responses=op.get('responses',{})
        response=next((r for code,r in responses.items() if code.startswith('2')),{})
        payload=response.get('content',{}).get('application/json',{}).get('schema',{})
        data=payload.get('properties',{}).get('data',{})
        params={p['name']: p.get('schema',{}) for p in op.get('parameters',[]) if p.get('in')=='path'}
        # Some mounted route templates do not repeat OpenAPI path metadata.
        import re
        params.update({k:{'type':'string'} for k in re.findall(r'\{([^}]+)\}',path)})
        lines.append(json.dumps(method.upper()+' '+path)+': { params: '+schema({'type':'object','properties':params,'required':list(params)})+', body: '+schema(body)+', response: '+schema(data)+' },')
lines += ['} as const', '', 'export type Operation = keyof typeof operations', "export type OperationData<K extends Operation> = z.output<(typeof operations)[K]['response']>", "export type OperationBody<K extends Operation> = z.input<(typeof operations)[K]['body']>", "export type OperationParams<K extends Operation> = z.input<(typeof operations)[K]['params']>", '']
target=root/'src/services/api/generated-contract.ts'
target.write_text('\n'.join(lines),encoding='utf-8')
