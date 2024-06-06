"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QL = exports.IDLAB = exports.GREL = exports.SHACL = exports.OWL = exports.RDFS = exports.RDF = exports.XSD = exports.FNO_HTTPS = exports.FNML = exports.FNO = exports.RML = exports.RR = void 0;
function createNamespace(baseUri, localNames) {
    return localNames.reduce((obj, localName) => ({ ...obj, [localName]: `${baseUri}${localName}` }
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    ), {});
}
exports.RR = createNamespace('http://www.w3.org/ns/r2rml#', [
    'BlankNode',
    'IRI',
    'Literal',
    'constant',
    'parentTriplesMap',
    'object',
    'objectMap',
    'parentTriplesMap',
    'class',
    'termType',
    'template',
    'datatype',
    'subject',
    'subjectMap',
    'predicateObjectMap',
    'predicate',
    'predicateMap',
    'joinCondition',
    'child',
    'parent',
    'language',
    'graph',
    'PredicateObjectMap',
    'PredicateMap',
    'ObjectMap',
    'SubjectMap',
    'Join',
    'TriplesMap',
]);
exports.RML = createNamespace('http://semweb.mmlab.be/ns/rml#', [
    'reference',
    'logicalSource',
    'source',
    'referenceFormulation',
    'iterator',
    'languageMap',
    'LogicalSource',
]);
exports.FNO = createNamespace('http://w3id.org/function/ontology#', [
    'executes',
]);
exports.FNML = createNamespace('http://semweb.mmlab.be/ns/fnml#', [
    'functionValue',
    'FunctionValue',
]);
exports.FNO_HTTPS = createNamespace('https://w3id.org/function/ontology#', [
    'executes',
]);
exports.XSD = createNamespace('http://www.w3.org/2001/XMLSchema#', [
    'boolean',
    'integer',
    'double',
    'string',
]);
exports.RDF = createNamespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', [
    'type',
    'first',
    'rest',
    'datatype',
    'JSON',
]);
exports.RDFS = createNamespace('http://www.w3.org/2000/01/rdf-schema#', [
    'subClassOf',
    'label',
    'range',
]);
exports.OWL = createNamespace('http://www.w3.org/2002/07/owl#', [
    'Restriction',
    'onProperty',
    'allValuesFrom',
    'Class',
    'intersectionOf',
    'someValuesFrom',
    'ObjectProperty',
]);
exports.SHACL = createNamespace('http://www.w3.org/ns/shacl#', [
    'targetClass',
    'targetNode',
]);
exports.GREL = createNamespace('http://users.ugent.be/~bjdmeest/function/grel.ttl#', [
    'array_join',
    'controls_if',
    'bool_b',
    'any_true',
    'any_false',
    'array_sum',
    'array_product',
    'p_array_a',
    'string_endsWith',
    'valueParameter',
    'valueParameter2',
    'string_sub',
    'string_replace',
    'p_string_find',
    'p_string_replace',
    'date_now',
    'boolean_not',
    'array_get',
    'param_int_i_from',
    'param_int_i_opt_to',
    'string_split',
    'p_string_sep',
    'date_inc',
    'p_date_d',
    'p_dec_n',
    'param_n2',
    'p_string_unit',
    'math_max',
    'math_min',
    'boolean_and',
    'boolean_or',
    'param_rep_b',
    'toUpperCase',
    'string_toString',
    'string_toNumber',
    'p_any_e',
    'string_contains',
    'string_length',
    'array_length',
    'math_ceil',
]);
exports.IDLAB = createNamespace('http://example.com/idlab/function/', [
    'equal',
    'notEqual',
    'getMIMEType',
    'str',
    'otherStr',
    'isNull',
    'random',
    'concat',
    'delimiter',
    'listContainsElement',
    'list',
    'trueCondition',
    'strBoolean',
]);
exports.QL = createNamespace('http://semweb.mmlab.be/ns/ql#', [
    'JSONPath',
    'XPath',
    'CSV',
]);
//# sourceMappingURL=Vocabulary.js.map