declare type Namespace<T extends string, TBase extends string> = {
    [key in T]: `${TBase}${key}`;
};
export declare const RR: Namespace<"object" | "BlankNode" | "IRI" | "Literal" | "constant" | "parentTriplesMap" | "objectMap" | "class" | "termType" | "template" | "datatype" | "subject" | "subjectMap" | "predicateObjectMap" | "predicate" | "predicateMap" | "joinCondition" | "child" | "parent" | "language" | "graph" | "PredicateObjectMap" | "PredicateMap" | "ObjectMap" | "SubjectMap" | "Join" | "TriplesMap", "http://www.w3.org/ns/r2rml#">;
export declare const RML: Namespace<"reference" | "logicalSource" | "source" | "referenceFormulation" | "iterator" | "languageMap" | "LogicalSource", "http://semweb.mmlab.be/ns/rml#">;
export declare const FNO: Namespace<"executes", "http://w3id.org/function/ontology#">;
export declare const FNML: Namespace<"functionValue" | "FunctionValue", "http://semweb.mmlab.be/ns/fnml#">;
export declare const FNO_HTTPS: Namespace<"executes", "https://w3id.org/function/ontology#">;
export declare const XSD: Namespace<"string" | "boolean" | "integer" | "double", "http://www.w3.org/2001/XMLSchema#">;
export declare const RDF: Namespace<"datatype" | "type" | "first" | "rest" | "JSON", "http://www.w3.org/1999/02/22-rdf-syntax-ns#">;
export declare const RDFS: Namespace<"subClassOf" | "label" | "range", "http://www.w3.org/2000/01/rdf-schema#">;
export declare const OWL: Namespace<"Restriction" | "onProperty" | "allValuesFrom" | "Class" | "intersectionOf" | "someValuesFrom" | "ObjectProperty", "http://www.w3.org/2002/07/owl#">;
export declare const SHACL: Namespace<"targetClass" | "targetNode", "http://www.w3.org/ns/shacl#">;
export declare const GREL: Namespace<"array_join" | "controls_if" | "bool_b" | "any_true" | "any_false" | "array_sum" | "array_product" | "p_array_a" | "string_endsWith" | "valueParameter" | "valueParameter2" | "string_sub" | "string_replace" | "p_string_find" | "p_string_replace" | "date_now" | "boolean_not" | "array_get" | "param_int_i_from" | "param_int_i_opt_to" | "string_split" | "p_string_sep" | "date_inc" | "p_date_d" | "p_dec_n" | "param_n2" | "p_string_unit" | "math_max" | "math_min" | "boolean_and" | "boolean_or" | "param_rep_b" | "toUpperCase" | "string_toString" | "string_toNumber" | "p_any_e" | "string_contains" | "string_length" | "array_length" | "math_ceil", "http://users.ugent.be/~bjdmeest/function/grel.ttl#">;
export declare const IDLAB: Namespace<"equal" | "notEqual" | "getMIMEType" | "str" | "otherStr" | "isNull" | "random" | "concat" | "delimiter" | "listContainsElement" | "list" | "trueCondition" | "strBoolean", "http://example.com/idlab/function/">;
export declare const QL: Namespace<"JSONPath" | "XPath" | "CSV", "http://semweb.mmlab.be/ns/ql#">;
export {};
