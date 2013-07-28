currentItem = prj;
currentItemStack.push(prj);

// SCRIPT
currentItemStack.push(currentItem);
log("Begin script");


function append(array, e) {
  array[array.length] = e;
}

function debugDump(obj) {
  log("debugDump: " + obj);
  for (var name in obj) {
    log(name + " = " + obj[name]);
  }
}
INFINITY = "*";
/* ============================================================================== */

PUBLIC = "public";
PROTECTED = "protected";
PACKAGE = "package";
PRIVATE = "private";

vkPROTECTED = "vkProtected";
vkPUBLIC = "vkPublic";
vkPACKAGE = "vkPackage";
vkPRIVATE = "vkPrivate";

assocPUBLIC = "0";
assocPROTECTED = "1";
assocPRIVATE = "2";
assocPACKAGE = "3";

PACKAGE = 0;
AGGREGATE = 1;
COMPOSITE = 2;
INFINITY = "*";

/* Log levels */
TRACE = 0;
DEBUG = 1;
INFO = 2;
WARN = 3;
ERROR = 4;
NONE = 5;
function Logger(level, failFast) {
  this.error = Logger_error;
  this.warn = Logger_warn;
  this.info = Logger_info;
  this.debug = Logger_debug;
  this.trace = Logger_trace;
  this.level = level;
  this.failFast = failFast;
  this.assert = Logger_assert;
}

function Logger_assert(condition, message) {
  if (!condition) {
    this.error(message);
  }
  return condition;
}
function Logger_error(message) {
  if (this.level <= ERROR) {
    log("ERROR: " + message);
    if (this.failFast) throw "abort";
  }
}
function Logger_warn(message) {
  if (this.level <= WARN) {
    log("WARNING: " + message);
  }
}
function Logger_info(message) {
  if (this.level <= INFO) {
    log(message);
  }
}
function Logger_debug(message) {
  if (this.level <= DEBUG) {
    log("DEBUG: " + message);
  }
}
function Logger_trace(message) {
  if (this.level <= TRACE) {
    log("TRACE: " + message);
  }
}
logger = new Logger(TRACE, false);

function Universe() {
  this.getFacet = Universe_getFacet;
  this.putFacet = Universe_putFacet;
  this.putUmlObject = Universe_putUmlObject;
  this.getUmlObject = Universe_getUmlObject;
  this.putRdfObject = Universe_putRdfObject;
  this.getRdfObject = Universe_getRdfObject;
  this.putXsdObject = Universe_putXsdObject;
  this.getXsdObject = Universe_getXsdObject;
  this.ontologyList = new Array();
  this.getUriList = Universe_getUriList;
  this.addAggregation = Universe_addAggregation;
  this.addComposition = Universe_addComposition;
  this.addAssociationQualifier = Universe_addAssociationQualifier;
  this.UmlContainer = UmlContainer;
  this.getOwl = Universe_getOwl;
  this.getThing = Universe_getThing;
  this.toNamespaceURI = Universe_toNamespaceURI;
  this.UmlContainer();
  

  this.classMap = new Object();
  this.packageList = new Array();
  this.xsdSchemaList = new Array();
  this.simpleTypeSchemas = new Array();
  this.classExtras = new Object();
  
  this.index = new Object();
  this.pathMap = new Object();

  this.xsd = new XmlSchema(this);
  this.rdfs = new RdfSchema(this);
}

function Universe_toNamespaceURI(uri) {
  var delim = uri.lastIndexOf('#');
  if (delim < 0) {
    delim = uri.lastIndexOf('/');
  }
  var ontologyURI = uri.substring(0, delim+1);
  return ontologyURI;
}

function Universe_getOwl() {
  logger.debug("getOwl");
  var owl = this.getRdfObject("http://www.w3.org/2002/07/owl#");
  if (owl == null) {
    owl = new Ontology(this, "owl", "http://www.w3.org/2002/07/owl#");
  }
  return owl;
}

function Universe_getThing() {
  logger.debug("getThing");
  var thing = this.getRdfObject("http://www.w3.org/2002/07/owl#Thing");
  if (thing == null) {
    var owl = this.getOwl();
    thing = owl.createClass("Thing");
  }
  return thing;
}

function Universe_addAssociationQualifier(typeURI, propertyURI, encapsulation) {
  logger.debug("addAssociationQualifier(" + typeURI + ", " + propertyURI + ", " + encapsulation + ")");
  var qualifier = new AssociationQualifier(propertyURI, encapsulation);
  var extras = this.classExtras[typeURI];
  if (extras == null) {
    extras = new ClassExtras(typeURI);
    this.classExtras[typeURI] = extras;
  }
  extras.associationQualifierMap[propertyURI] = qualifier;
  return qualifier;
  
}

/* deprecated */
function Universe_addAggregation(typeURI, propertyURI) {
  logger.debug("addAggregation(" + typeURI + ", " + propertyURI);
  var extras = this.classExtras[typeURI];
  if (extras == null) {
    extras = new ClassExtras(typeURI);
    this.classExtras[typeURI] = extras;
  }
  append(extras.aggregationList, propertyURI);  
}
/* deprecated */
function Universe_addComposition(typeURI, propertyURI) {
  logger.debug("addComposition(" + typeURI + ", " + propertyURI);
  var extras = this.classExtras[typeURI];
  if (extras == null) {
    extras = new ClassExtras(typeURI);
    this.classExtras[typeURI] = extras;
  }
  append(extras.compositionList, propertyURI);
}

function Universe_getUriList(name) {
  logger.debug("getUriList " + name);
  var suffix = "#" + name;
  var list = new Array();
  for (var key in this.index) {
    if (suffix == key.substring(key.length - suffix.length)) {
      append(list, key);
    }
  }
  logger.debug("end getUriList");
  return list;
}

function Universe_putXsdObject(uri, object) {
  this.putFacet("xsd", uri, object);
}

function Universe_getXsdObject(uri) {
  return this.getFacet("xsd", uri);
}

function Universe_putUmlObject(uri, object) {
  this.putFacet("uml", uri, object);
}

function Universe_getUmlObject(uri) {
  return this.getFacet("uml", uri);
}
function Universe_putRdfObject(uri, object) {
  this.putFacet("rdf", uri, object);
}

function Universe_getRdfObject(uri) {
  return this.getFacet("rdf", uri);
}

function Universe_putFacet(facetName, uri, object) {
  logger.debug("putFacet " + facetName + " " + uri);

  if (!uri) {
    logger.error("Cannot index " + facetName + " object because the uri is not defined");
    return;
  }
  
  var entry = this.index[uri];
  if (!entry) {
    entry = new Object();
    this.index[uri] = entry;
  }
  if (entry[facetName]) {
    var message = "Duplicate name: " + uri;
    logger.error(message);
    throw message;
  }
  entry[facetName] = object;
}

function Universe_getFacet(facetName, uri) {
  var entry = this.index[uri];
  if (entry) {
    return entry[facetName];
  }
  return null;
}

UNIVERSE = new Universe();


function ClassExtras(classURI) {
  this.classURI = classURI;
  this.aggregationList = new Array();
  this.compositionList = new Array();
  this.associationQualifierMap = new Object();
}

function RdfSchema(universe) {
  this.universe = universe;
  this.isOntology = true;
  this.prefix = "rdfs";
  this.uri = "http://www.w3.org/2000/01/rdf-schema#";
  this.localType = new Object();
  this.LITERAL = new Literal(this, "Literal");
  
  for (var name in this.localType) {
    var obj = this.localType[name];
    universe.putRdfObject(obj.uri, obj);
  }
}


function XmlSchema(universe) {
  this.universe = universe;
  universe.xmlSchema = this;
  this.localType = new Object();
  this.isOntology = true;
  this.prefix = "xsd";
  this.uri = "http://www.w3.org/2001/XMLSchema#";
  this.universe = universe;
  this.INT = new Literal(this, "string");
  this.BOOLEAN = new Literal(this, "boolean");
  this.DECIMAL = new Literal(this, "decimal");
  this.FLOAT = new Literal(this, "float");
  this.DOUBLE = new Literal(this, "double");
  this.DURATION = new Literal(this, "duration");
  this.DATETIME = new Literal(this, "dateTime");
  this.TIME = new Literal(this, "time");
  this.DATE = new Literal(this, "date");
  this.GYEARMONTH = new Literal(this, "gYearMonth");
  this.GYEAR = new Literal(this, "gYEAR");
  this.GMONTHDAY = new Literal(this, "gMonthDay");
  this.GDAY = new Literal(this, "gDay");
  this.GMONTH = new Literal(this, "gMonth");
  this.HEXBINARY = new Literal(this, "hexBinary");
  this.BASE64BINARY = new Literal(this, "base64Binary");
  this.ANYURI = new Literal(this, "anyURI");
  this.NORMALIZEDSTRING = new Literal(this, "normalizedString");
  this.TOKEN = new Literal(this, "token");
  this.LANGUAGE = new Literal(this, "language");
  this.NMTOKEN = new Literal(this, "NMTOKEN");
  this.NAME = new Literal(this, "Name");
  this.NCNAME = new Literal(this, "NCName");
  this.INTEGER = new Literal(this, "integer");
  this.NONPOSITIVEINTEGER = new Literal(this, "nonPositiveInteger");
  this.NEGATIVEINTEGER = new Literal(this, "negativeInteger");
  this.LONG = new Literal(this, "long");
  this.INT = new Literal(this, "int");
  this.SHORT = new Literal(this, "short");
  this.BYTE = new Literal(this, "byte");
  this.NONNEGATIVEINTEGER = new Literal(this, "nonNegativeInteger");
  this.UNSIGNEDLONG = new Literal(this, "unsignedLong");
  this.UNSIGNEDINT = new Literal(this, "unsignedInt");
  this.UNSIGNEDSHORT = new Literal(this, "unsignedShort");
  this.UNSIGNEDBYTE = new Literal(this, "unsignedByte");
  this.POSITIVEINTEGER = new Literal(this, "positiveInteger");
  
  for (var name in this.localType) {
    var obj = this.localType[name];
    universe.putRdfObject(obj.uri, obj);
    universe.putXsdObject(obj.uri, obj);
  }

}

function Literal(schema, name) {
  this.ontology = schema;
  this.schema = schema;
  this.parentContainer = schema;
  this.namespace = schema;
  this.name = name;
  this.uri = schema.uri + name;
  schema.localType[name] = this;
}

function ModelBuilder() {
  logger.debug("new ModelBuilder");
  this.scanGeneralizations = ModelBuilder_scanGeneralizations;
  this.createFieldFromAssociation = ModelBuilder_createFieldFromAssociation;
  this.scanContainer = ModelBuilder_scanContainer;
  this.scanModel = ModelBuilder_scanModel;
  this.scanPackage = ModelBuilder_scanPackage;
  this.scanClass = ModelBuilder_scanClass;
  this.scanFields = ModelBuilder_scanFields;
  this.scanUniverse = ModelBuilder_scanUniverse;
  this.scanAssociations = ModelBuilder_scanAssociations;
  this.scanEnum = ModelBuilder_scanEnum;
  this.currentPackage = ModelBuilder_currentPackage;
  this.pushPackage = ModelBuilder_pushPackage;
  this.popPackage = ModelBuilder_popPackage;
  this.parseParticipantAttachments = ModelBuilder_parseParticipantAttachments;
  this.addQualifiers = ModelBuilder_addQualifiers;
  this.scanObject = ModelBuilder_scanObject;
  this.handleParticipantAttachment = ModelBuilder_handleParticipantAttachment;
  
  this.universe = null; /* will be assigned later */
  
  this.packageStack = new Array();
  
}


function ModelBuilder_popPackage() {
  this.packageStack.length = this.packageStack.length-1;
}

function ModelBuilder_pushPackage(umlPackage) {
  append(this.packageStack, umlPackage);
}

function ModelBuilder_currentPackage() {
  return this.packageStack.length == 0 ? null : this.packageStack[this.packageStack.length-1];
}

function ModelBuilder_scanGeneralizations() {
  logger.debug("scanGeneralizations");
  var metaClass = app.MetaModel.FindMetaClass("UMLGeneralization");
  var size = metaClass.GetInstanceCount();
  for (var i=0; i<size; i++) {
     elem = metaClass.GetInstanceAt(i);

     if (elem.IsKindOf("UMLGeneralization") && elem.Child && elem.Parent) {

       // elem.Child.Pathname works!
       
       var childName = elem.Child.Name;
       var parentName = elem.Parent.Name;
       
       

       var childClass = this.universe.pathMap[elem.Child.Pathname];
       
       if (!childClass) {
         logger.error("Derived class not found: " + childName);
         continue;
       }
       
       var parentClass = null;
       if (childClass.constructor == XsdSimpleType) {
         var name = elem.Parent.Name;
         parentClass = this.universe.xsd.localType[name];
       } else {
           parentClass = this.universe.pathMap[elem.Parent.Pathname];
         
       }
       if (!parentClass) {
         logger.error("Base class not found: " + parentName);
       }

       if (childClass.superTypes == null) {
         childClass.superTypes = new Array();
       }
       logger.debug(childClass.name + " is subclass of " + parentClass.name);
       append(childClass.superTypes, parentClass);

       if (parentClass.subTypes == null) {
         parentClass.subTypes = new Array();
       }
       append(parentClass.subTypes, childClass);
       
    } 
  }
}



function ModelBuilder_scanAssociations() {
  logger.debug("scanAssociations");
   var metaClass = app.MetaModel.FindMetaClass("UMLAssociation");
    var size = metaClass.GetInstanceCount();
    for (var i=0; i<size; i++) {
       elem = metaClass.GetInstanceAt(i);
       
       if (elem.IsKindOf("UMLAssociation")) {
          if (elem.GetConnectionCount() != 2) continue;
          if (!elem.GetConnectionAt(0).Participant) continue;
          if (!elem.GetConnectionAt(1).Participant) continue;
          
          var e1=elem.GetConnectionAt(0);
          var e2=elem.GetConnectionAt(1);
          var n1 = e1.Participant.Name;
          var n2 = e2.Participant.Name;
         
          
          log("before qualifier count");
          log("qualifierCount = " + elem.getConnectionAt(0).GetQualifierCount());
          
          var t1 = this.universe.pathMap[e1.Participant.Pathname];
          var t2 = this.universe.pathMap[e2.Participant.Pathname];
          if (!t1) {
            log("WARNING: Ignoring the association " + n1 + " => " + n2 + " because the type " + n1 + " is not known");
            continue;
          }
          if (!t2) {
            log("WARNING: Ignoring the association " + n1 + " => " + n2 + " because the type " + n2 + " is not known");
            continue;
          }
          
          logger.debug("ASSOCIATION: " + t1.name + " => " + t2.name);
          
          var classOrEnum1 = (t1.constructor == ClassType) || (t1.constructor == EnumType);
          var classOrEnum2 = (t2.constructor == ClassType) || (t2.constructor == EnumType);
          if (classOrEnum1 && classOrEnum2) {

            var f1 = this.createFieldFromAssociation(t1, t2, e2, e1);
            var f2 = this.createFieldFromAssociation(t2, t1, e1, e2);
            if (f1) {
              this.addQualifiers(f1, e1);
            }
            if (f2) {
              this.addQualifiers(f2, e2);
            }
            if (f1 && f2) {
              f1.inverseOf = f2;
              f2.inverseOf = f1;
            }
            
            
          } else {
            logger.trace("Skipping association because ends are not objects");
        }
         
        } 
    }
}


function ModelBuilder_addQualifiers(field, connection) {
  logger.trace("ModelBuilder_addQualifiers")
  var count = connection.GetQualifierCount();
  if (count == 0) return;
  if (!field.umlClass) return;
  
  var q = new Qualifier(field, field.umlClass);
  for (var i=0; i<count; i++) {
    var umlQual = connection.getQualifierAt(i);
    var name = umlQual.Name;
    logger.debug("add UML qualifier [property=" + field.name + ", key=" + name + ", subject=" + field.umlClass.name +  "]");
    append(q.keyList, name);
  }
  append(field.umlPackage.qualifierList, q);
  
  
}

function ModelBuilder_createFieldFromAssociation(declaringClass, fieldType, connection, otherEnd) {
  logger.debug("createFieldFromAssociation");
  var fieldName = connection.Name;
  if (!fieldName) {
    if (declaringClass.stereotypeName == "List") {
      logger.debug("Setting element type for list " + declaringClass.name + ": " + fieldType.name);
      declaringClass.elemType = fieldType;
    }
    return null;
  }
  
  logger.debug("declaringClass=" + declaringClass.name + ", package=" + declaringClass.umlPackage);

  var field = new Field(null, declaringClass, declaringClass.umlPackage, this.universe);
  field.type = fieldType;
  field.name = fieldName;
  field.description = connection.Documentation;
  field.setMultiplicity(  connection.Multiplicity );
  field.setVisibility(  connection.Visibility  );
  field.stereotypeName = connection.StereotypeName;
  
  this.parseParticipantAttachments(field, connection);
  if (!field.uri) {
    field.uri = declaringClass.umlPackage.uri + fieldName;
  }
  
  var qualifier = null;
  if (otherEnd.Aggregation == AGGREGATE || otherEnd.Aggregation == COMPOSITE) {
    qualifier = this.universe.addAssociationQualifier(declaringClass.uri, field.uri, otherEnd.Aggregation);
  }
  
  /* deprecated
  if (otherEnd.Aggregation == AGGREGATE) {
    this.universe.addAggregation(declaringClass.uri, field.uri);
  }
  if (otherEnd.Aggregation == COMPOSITE) {
    this.universe.addComposition(declaringClass.uri, field.uri);
  }
  */
  logger.debug("field: name=" + field.name + ", uri=" + field.uri);
  logger.trace(fieldName + ".stereotypeName = " + field.stereotypeName);
  logger.trace("otherEnd.Name=" + otherEnd.Name);
  
  if (!otherEnd.Name) {
    /* There is no inverse property, so we need to define the inverse
     * attributes on the current field. */
    
    if (qualifier == null) {
      qualifier = this.universe.addAssociationQualifier(declaringClass.uri, field.uri, null);
    }
    var e = connection.Aggregation;
    if (e == AGGREGATE || e == COMPOSITE) {
      qualifier.inverseEncapsulation = e;
    }
    qualifier.setInverseMultiplicity( otherEnd.Multiplicity );
    
    
  }
  return field;
  
  
}


function ModelBuilder_parseParticipantAttachments(field, p) {
  field.ordinal = 1000;
   var attachments = p.Attachments;
    var lines = attachments.split('\r\n');
    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      logger.trace("participant attachment " + field.name + " " + line);
      if (line.length == 0) continue;
      if (line.charAt(0) == '#') {
        field.ordinal = parseInt(line.substring(1));
      } else {
        var colon = line.indexOf('=');
        var key = line.substring(0, colon);
        var value = line.substring(colon+1);
        this.handleParticipantAttachment(field, key, value);
      }
    }
}

function ModelBuilder_handleParticipantAttachment(field, key, value) {
  if (key == "subPropertyOf") {
    field.subPropertyOf = value;
  } if (key == "domain") {
    field.domainURI = value;
  } if (key == "uri") {
    field.uri = value;
  } if (key == "preserveRestriction" && "true"==value) {
    field.preserveRestriction = true;
  }
} 




function ModelBuilder_scanUniverse(root, universe) {
  logger.debug("scanUniverse");
  this.universe = universe;
  this.scanContainer(root, universe);
  for (key in universe.classMap) {
    var type = universe.classMap[key];
    this.scanFields(type);
  }
  this.scanAssociations();
  this.scanGeneralizations();
}

function ModelBuilder_scanClass(uml, parent) {
  logger.debug("scanClass");
  var classType = new ClassType(uml, parent, this.currentPackage(), this.universe);

  this.universe.classMap[classType.uri] = classType;
  
}

function ModelBuilder_scanObject(umlObject) {
  var pkg = this.currentPackage();
  logger.trace("add individual " + umlObject.Name + " to " + pkg.name);
  append(pkg.individualList, umlObject);
}

function ModelBuilder_scanModel(uml, parent) {
  logger.debug("scanModel " + uml.Name);
  var model = new Model(uml, parent, null, this.universe);
  this.scanContainer(uml, model, this.universe);
  
}

function ModelBuilder_scanPackage(uml, parent) {
  logger.debug("scanPackage " + uml.Name);
  var pkg = new Package(uml, parent, this.currentPackage(), this.universe);
  append(this.universe.packageList, pkg);
  this.pushPackage(pkg);
  this.scanContainer(uml, pkg);
  this.popPackage();
}

function ModelBuilder_scanContainer(container, jsContainer) {
  logger.debug("scanContainer");
  for ( var i = 0; i < container.GetOwnedElementCount(); i++) {
    var elem = container.GetOwnedElementAt(i);

    if (elem.IsKindOf("UMLInterface")) {

    } else if (elem.IsKindOf("UMLClass")) {
      var stereotype = elem.MOF_GetAttribute("StereotypeName");
      if ("simpleType" == stereotype) {
         new SimpleType(elem, jsContainer, this.currentPackage(), this.universe);
        
      } else if ("individual" == stereotype) {
        /* TODO: scanIndividual */
      } else {
        this.scanClass(elem, jsContainer);
      }

    } else if (elem.IsKindOf("UMLEnumeration")) {
      this.scanEnum(elem, jsContainer);

    } else if (elem.IsKindOf("UMLSubsystem")) {

    } else if (elem.IsKindOf("UMLModel")) {
      this.scanModel(elem, jsContainer);

    } else if (elem.IsKindOf("UMLPackage")) {
      var stereotype = elem.StereotypeName;
      if ("datatypes" == stereotype) {
        new XsdTypeSchema(elem, this.universe);
      } else {
        this.scanPackage(elem, jsContainer);
      }

    } else if (elem.IsKindOf("UMLObject")) {
      this.scanObject(elem);
    }
  }
}

function ModelBuilder_scanEnum(uml, parent) {
  logger.debug("scanEnum");
  var enumType = new EnumType(uml, parent, this.currentPackage(), this.universe);
}

function ModelBuilder_scanFields(type) {
    var attrCount = type.uml.MOF_GetCollectionCount("Attributes");

    for (var i=0; i<attrCount; i++) {
      var attr = type.uml.MOF_GetCollectionItem("Attributes", i);
      var field = new Field(attr, type, type.umlPackage, this.universe);      
    }
}


function UmlObject(uml, parent, umlPackage, universe) {
  /* if (!universe) throw "universe undefined while creating " + uml.Name; */
  logger.debug("new UmlObject");
  this.uml = uml;
  this.parentContainer = parent;
  this.umlPackage = umlPackage;
  try {
    this.pathname = uml.Pathname;
  } catch (oops) {
    this.pathname = null;
    /*
     * Ignore for uml elements that don't have a pathname, such as
     * UMLAssociation
     */
  }
  if (uml) {
    this.name = uml.Name;
    this.documentation = uml.Documentation;
    if (
        (!this.documentation) &&
        (this.constructor != Package) &&
        (this.constructor != Model) &&
        (this.constructor != SimpleType) &&
        (parent.uri != "http://www.w3.org/2001/XMLSchema#") &&
        (this.uri) &&
        (this.uri.indexOf("http://www.w3.org/2000/01/rdf-schema#") == -1) &&
        (this.uri.indexOf("http://www.w3.org/2002/07/owl#") == -1)
    ) {
      var entity = this.name + " @" + this.pathname; 
      logger.warn("Documentation is missing for " + entity);
    }
  }
  if (umlPackage) {
    umlPackage.localType[this.name] = this;
  }
  if (umlPackage && universe && (this.constructor != Model) && (this.constructor != EnumLiteral)) {
    this.uri = umlPackage.uri + this.name;
    universe.putUmlObject(this.uri, this);
  }
  if (universe) {
    logger.debug("indexing " + this.uml.Pathname);
    universe.pathMap[this.uml.Pathname] = this;
  }
  
}


function UmlContainer_addModel(model) {
  append(this.modelList, model);
}
function UmlContainer_addPackage(pkg) {
  append(this.packageList, pkg);
  
}
function UmlContainer_addClass(classType) {
  logger.debug("UmlContainer_addClass " + classType.name);
  append(this.classList, classType);
}

function UmlContainer() {
  this.addModel = UmlContainer_addModel;
  this.addPackage = UmlContainer_addPackage;
  this.addClass = UmlContainer_addClass;
  this.modelList = new Array();
  this.packageList = new Array();
  this.classList = new Array();
  this.enumList = new Array();
}
function Model(uml, parent, universe) {
  
  this.UmlContainer = UmlContainer;
  this.UmlContainer();
  
  this.UmlObject = UmlObject;
  this.UmlObject(uml, parent, universe);
  parent.addModel(this);
  logger.debug("Scanning Model..." + this.name);
}

function Package(uml, parent, parentPackage, universe) {
  logger.debug("new Package " + uml.Name);
  this.parseAttachments = Package_parseAttachments;
  this.parseAttachment = Package_parseAttachment;
  this.UmlContainer = UmlContainer;
  this.UmlContainer();
  this.UmlObject = UmlObject;
  this.UmlObject(uml, parent, null, null);
  this.isOntology = true;
  this.universe = universe;
  this.localType = new Object();
  this.qualifierList = new Array();
  this.individualList = new Array();
  this.orgId = null;
  this.contextURI = null;
  
  this.parseAttachments();
  parent.addPackage(this);
  logger.debug("Scanning Package..." + this.name);
  logger.debug("uri = " + this.uri);
  if (!this.uri) {
    logger.error("URI is not defined for package " + this.name);
    throw "abort";
  }
  if (!this.prefix) {
    this.prefix = this.name;
  } 
    
  
  if (universe && this.uri) {
    universe.putUmlObject(this.uri, this);
  }
  if (universe) {
    universe.pathMap[this.Pathname] = this;
  }
  
}

function Package_parseAttachments() {
  logger.debug("Package_parseAttachments " + this.name);
  if (!this.uml) return;
   var attachments = this.uml.Attachments;
    var lines = attachments.split('\r\n');
    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      logger.trace(line);
      var colon = line.indexOf('=');
      if (colon < 0) continue;
      var key = line.substring(0, colon);
      var value = line.substring(colon+1);
      this.parseAttachment(key, value);
    }
  
}
function Package_parseAttachment(key, value) {
  if (key == "uri") {
    this.uri = value;
  } else if (key == "prefix") {
    log("PREFIX = " + value);
    this.prefix = value;
  } else if (key == "orgId") {
    this.orgId = value;
  } else if (key == "context") {
    this.contextURI = value;
  }
}

function EnumLiteral(uml, parent, umlPackage, universe) {
  logger.debug("new EnumLiteral");
  this.UmlObject = UmlObject;
  this.UmlObject(uml, parent, umlPackage, universe);
  
}


function EnumType(uml, parent, umlPackage, universe) {
  logger.debug("new EnumType " + uml.Name);
  this.UmlObject = UmlObject;
  this.UmlObject(uml, parent, umlPackage, universe);
  this.superTypes = null;
  append(umlPackage.enumList, this);
  this.literalList = new Array();
  if (uml) {
    this.isExtensible = false;
    for (var i=0; i<uml.GetLiteralCount(); i++) {
      var literal = uml.getLiteralAt(i);
      if (literal.Name == '<extensible>') {
        this.isExtensible = true;
        continue;
      }
      var enumLiteral = new EnumLiteral(literal, this, this.umlPackage, universe);
      append(this.literalList, enumLiteral);
    }
  }
  
}


function PropertyValue(name, value) {
  logger.debug("new FieldValue " + name + " = " + value);

  this.name = name;
  this.value = value;
  
  
}

function Individual_scanProperties() {
  logger.debug("scanProperties " + this.name);
  var attrCount = this.uml.MOF_GetCollectionCount("Attributes");

  for (var i=0; i<attrCount; i++) {
      var attr = this.uml.MOF_GetCollectionItem("Attributes", i);
      var name = attr.Name;
      var value = attr.TypeExpression;
      
      this.properties[name] = new PropertyValue(name, value);
  }
}

function SimpleType(uml, parent, umlPackage, universe) {
  logger.debug("new SimpleType " + uml.Name);
  this.UmlObject = UmlObject;
  this.UmlObject(uml, parent, umlPackage, universe);
  this.scanProperties = Individual_scanProperties;
  this.properties = new Object();
  this.scanProperties();
  append(this.umlPackage.classList, this);
  
}

function ClassType(uml, parent, umlPackage, universe) {
  
  logger.debug("new UmlClass " + uml.Name);
  this.UmlObject = UmlObject;
  this.UmlObject(uml, parent, umlPackage, universe);
  this.addField = ClassType_addField; 
  this.getFieldByName = ClassType_getFieldByName;
  this.fieldList = new Array();
  this.superTypes = null;
  this.subTypes = null;
  this.intersection = null;
  this.simpleContentType = null;
  this.documentation = null;
  
  if (uml) {
    this.stereotypeName = uml.StereotypeName;
    this.isAbstract = uml.IsAbstract;
    this.documentation = uml.Documentation;
  } else {
    this.stereotypeName = null;
    this.isAbstract = false;
  }

  logger.debug("Scanning Class..." + this.name);
  if (!this.umlPackage) {
    logger.warn("package undefined for " + this.name);
  } else {
    append(this.umlPackage.classList, this);
  }
  logger.debug(" uri = " + this.uri);
  /* parent.addClass(this); */
}

function ClassType_getFieldByName(name) {
  for (var i=0; i<this.fieldList.length; i++) {
    var field = this.fieldList[i];
    if (field.name == name)  return field;
  }
  return null;
  
}

function ClassType_addField(field) {
  append(this.fieldList, field);
}


function Individual(name, namespace, documentation) {
  this.namespace = namespace;
  this.name = name;
  this.documentation = documentation;
  this.property = new Object();
}


function ValueSpace(text) {
  logger.debug("new ValueSpace: " + text);
  this.text = text;
}


function Field(uml, parent, umlPackage, universe) {
  logger.debug("new Field " + (uml ? uml.Name : ""));
  this.setMultiplicity = Field_setMultiplicity;
  this.setVisibility = Field_setVisibility;
  this.collectValueSpace = Field_collectValueSpace;
  this.parseAttachments = Field_parseAttachments;
  this.handleAttachment = Field_handleAttachment;
  this.handleXsdAttachment = Field_handleXsdAttachment;
  
  this.UmlObject = UmlObject;
  this.UmlObject(uml, parent, umlPackage);
  this.stereotypeName = null;
  this.isXmlAttribute = false;
  this.isXmlValue = false;
  this.visibility = null;
  this.ordinal = 1000;
  this.inverseOf = null;
  this.umlClass = parent;
  this.subPropertyOf = null;
  this.domainURI = null;
  this.preserveRestriction = false;

  if (uml) {
    this.name = uml.Name;
    this.stereotypeName = uml.stereotypeName;
    this.multiplicity = uml.Multiplicity ? uml.Multiplicity : "1";
    this.description = uml.Documentation ? uml.Documentation : "";
    this.setVisibility(  uml.MOF_GetAttribute("Visibility")  );
    this.collectValueSpace(uml);
    logger.trace("Field " + this.name + ".multiplicity=" + this.multiplicity);
    this.setMultiplicity(this.multiplicity);
    var rawType = uml.Type_;
    
    
    /* First check to see if the type is fully-defined in StarUML */
    if (rawType) {
      logger.debug("rawType " + rawType.Pathname);
      this.type = universe.pathMap[rawType.Pathname];
    }
    
    if (!this.type) {
      logger.trace("Checking to see if the field type is an XSD primitive type");
      var typeName = uml.TypeExpression;
      if (typeName) {
        this.type = universe.xsd.localType[typeName];
        if (!this.type) {
          logger.trace("Checking to see if the field type is an RDFS Literal");
          this.type = universe.rdfs.localType[typeName];
        }
      }
    }
    
    if (!this.type) {
      logger.trace("Checking to see if the simple type name is unique in the universe.");
      var list = universe.getUriList(typeName);
      if (list.length == 0) {
        logger.error("Type of field " + parent.name + "." + this.name + " is not known: " + typeName);
        
      } else if (list.length > 1) {
        logger.error("Type of field " + parent.name + "." + this.name + " is ambiguous: " + typeName);
      } else {
        var uri = list[0];
        this.type = universe.getUmlObject(uri);
      }
    }
    
  }

  if (!umlPackage) {
    logger.error("Package not defined for field " + this.name);
  }
  this.parseAttachments();
  if (umlPackage && this.name && !this.uri) {
    this.uri = umlPackage.uri + this.name;
    logger.trace("field.uri = " + this.uri);
  }
  parent.addField(this);
  logger.debug("end Field constructor");
}

function Field_parseAttachments() {

  logger.debug("Field_parseAttachments " + this.name);
  if (!this.uml) return;
   var attachments = this.uml.Attachments;
    var lines = attachments.split('\r\n');
    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      
      if (line.charAt(0) == '#') {
        this.ordinal = parseInt(line.substring(1));
        continue;
      }
      
      
      logger.trace(line);
      var colon = line.indexOf('=');
      if (colon < 0) continue;
      var key = line.substring(0, colon);
      var value = line.substring(colon+1);
      this.handleAttachment(key, value);
    }
}

function Field_handleAttachment(key, value) {
  if (key == "xsd") {
    this.handleXsdAttachment(value);
  } if (key == "subPropertyOf") {
    this.subPropertyOf = value;
  } if (key == "domain") {
    this.domainURI = value;
  } if (key == "uri") {
    this.uri = value;
    
  } 
  if (key == "preserveRestriction") {
    this.preserveRestriction = "true" == value;
  }
}

function Field_handleXsdAttachment(value) {
  var list = value.split(',');
  for (var i=0; i<list.length; i++) {
    var key = list[i];
    
    if (key == "attr") {
      this.isXmlAttribute = true;
      logger.trace("Field " + this.name + " isXmlAttribute");
    }
    if (key == "value") {
      this.isXmlValue = true;
      this.umlClass.simpleContentType = this.type;
      logger.trace("Field " + this.name + " isXmlValue");
    }
  }
}

function Field_collectValueSpace(attr) {
  logger.debug("collectValueSpace for " + this.name);
    var size = attr.getConstraintCount();
    valueSpaceText = null;
    logger.debug("constraint count: " + size);
    for (var i=0; i<size; i++) {
      var con =  attr.getConstraintAt(i);
      logger.debug("constraint name: " + con.Name);
      if (con.Name=='valueSpace') {
        valueSpaceText=con.Body;
      }
    }
    if (valueSpaceText) {
      this.valueSpace = new ValueSpace(valueSpaceText);
    }
    logger.trace("end collectValueSpace");
}

function Field_setVisibility(visibility) {
  var v = "" + visibility;
  
  this.visibility =
    (vkPUBLIC==v) || (assocPUBLIC==v)     ? PUBLIC :
    (vkPROTECTED==v) || (assocPROTECTED==v) ? PROTECTED :
    (vkPACKAGE==v) || (assocPACKAGE==v)   ? PACKAGE :
    PRIVATE;
  
  this.isKey = (this.visibility == PROTECTED);
}

function Field_setMultiplicity(m) {
  logger.debug("setMultiplicity: " + this.name);
  if (!m) {
    m = "1";
  }
  this.multiplicity = m;
  if ("0..1" == m) {
    this.minCardinality = 0;
    this.maxCardinality = 1;
    
  } else if ("1" == m) {
    this.minCardinality = 1;
    this.maxCardinality = 1;
    
  } else if ("*" == m) {
    this.minCardinality = 0;
    this.maxCardinality = INFINITY;
    
  } else if ("1..*" == m) {
    this.minCardinality = 1;
    this.maxCardinality = INFINITY;
  } else {
    logger.error("Invalid multiplicity: " + m); 
  }
  logger.debug(this.name + ".Multiplicity = " + this.multiplicity);
}



/* ============================================================================== */

function Namespace(prefix, uri) {
  this.prefix = prefix;
  this.uri = uri;
}

function Writer() {
  this.print = Writer_print;
  this.println = Writer_println;
  this.pushIndent = Writer_pushIndent;
  this.popIndent = Writer_popIndent;
  this.indent = Writer_indent;
  this.text = "";
  this.depth = 0;
}
function Writer_pushIndent() {
  this.depth++;
  return this;
}

function Writer_popIndent() {
  this.depth--;
  return this;
}

function Writer_indent() {
  var spaces = "";
  for (var i=0; i<this.depth; i++) {
    spaces = spaces + "  ";
  }
  this.print(spaces);
  return this;
}
function Writer_print(text) {
  this.text = this.text + text;
  return this;
}
function Writer_println(message) {
  if (message) this.print(message);
  this.print("\n");
}

function OntologyWriter() {
  logger.debug("new OntologyWriter");
  this.Writer = Writer;
  this.Writer();
  this.printOntology = OntologyWriter_printOntology;
  this.printImports = OntologyWriter_printImports;
  this.printClasses = OntologyWriter_printClasses;
  this.printClass = OntologyWriter_printClass;
  this.printPrefix = OntologyWriter_printPrefix;
  this.printQName = OntologyWriter_printQName;
  this.printEnum = OntologyWriter_printEnum;
  this.printEnumList = OntologyWriter_printEnumList;
  this.printExtensibleEnum = OntologyWriter_printExtensibleEnum;
  this.printProperties = OntologyWriter_printProperties;
  this.printProperty = OntologyWriter_printProperty;
  this.printDomain = OntologyWriter_printDomain;
  this.printRange = OntologyWriter_printRange;
  this.printUnion = OntologyWriter_printUnion;
  this.printRestrictions = OntologyWriter_printRestrictions;
  this.printBinding = OntologyWriter_printBinding;
  this.printClassBindings = OntologyWriter_printClassBindings;
  this.printClassBinding = OntologyWriter_printClassBinding;
  this.printEnumBindings = OntologyWriter_printEnumBindings;
  this.printEnumBinding = OntologyWriter_printEnumBinding;
  this.printQualifiers = OntologyWriter_printQualifiers;
  this.printQualifier = OntologyWriter_printQualifier;
  this.printRdfsPrefixForBinding = OntologyWriter_printRdfsPrefixForBinding;
  this.printAssociationType = OntologyWriter_printAssociationType;
  this.printIndividuals = OntologyWriter_printIndividuals;
  this.getBindProperties = OntologyWriter_getBindProperties;
  this.printPropertyList = OntologyWriter_printPropertyList;
  this.printURI = OntologyWriter_printURI;
  this.addNamespace = OntologyWriter_addNamespace;
  this.quote = OntologyWriter_quote;
  this.printSubClassOf = OntologyWriter_printSubClassOf;
  this.printList = OntologyWriter_printList;
  this.printAllLists = OntologyWriter_printAllLists;
  this.printOntologyHeader = OntologyWriter_printOntologyHeader;
  this.escape = OntologyWriter_escape;
  this.computeBindingImports = OntologyWriter_computeBindingImports;
  this.addBindingImportsFromPropertyList = OntologyWriter_addBindingImportsFromPropertyList;
  this.printPropertyAsList = OntologyWriter_printPropertyAsList;
  this.addBindingImportsFromAssociationQualifiers = OntologyWriter_addBindingImportsFromAssociationQualifiers;
  this.printAssociationQualifier = OntologyWriter_printAssociationQualifier;
  this.printPrimitiveSubtypes = OntologyWriter_printPrimitiveSubtypes;
  
  this.ontology = null;
  logger.trace("end new OntologyWriter");
}

function OntologyWriter_addBindingImportsFromAssociationQualifiers(map, list, qmap) {
  logger.debug("OntologyWriter_addBindingImportsFromAssociationQualifiers");
  if (!qmap) return;
  
  for (propertyURI in qmap) {
    var qualifier = qmap[propertyURI];
    var p = qualifier.rdfProperty;
    var onto = p.ontology;
    if (map[onto.uri]) continue;
    map[onto.uri] = true;
    append(list, onto);
    logger.debug("IMPORT: " + onto.prefix);    
  }
}

/* deprecated */
function OntologyWriter_addBindingImportsFromPropertyList(map, sink, plist) {
  logger.debug("OntologyWriter_addBindingImportsFromPropertyList");
  if (!plist) return;
  
  for (var i=0; i<plist.length; i++) {
    var p = plist[i];
    var onto = p.ontology;
    if (map[onto.uri]) continue;
    map[onto.uri] = true;
    append(sink, onto);
    logger.debug("IMPORT: " + onto.prefix);
  }
}

function OntologyWriter_computeBindingImports(onto) {
  logger.debug("OntologyWriter_computeBindingImports");
  var map = new Object();
  var result = new Array();
  map["http://www.w3.org/2000/01/rdf-schema#"] = true;
  map["http://www.w3.org/1999/02/22-rdf-syntax-ns#"] = true;
  map["http://purl.org/semantictools/v1/vocab/bind#"] = true;
  map[onto.uri] = true;
  append(result, onto);
  
  var list = onto.classList;
  for (var i=0; i<list.length; i++) {
    var type = list[i];
    var alen = type.aggregatList ? type.aggregationList.length : 0;
    var clen = type.compositionList ? type.compositionList.length : 0;
    
    logger.debug("compute bindings for: " + type.name + "(" + alen + ", " + clen + ")");
    this.addBindingImportsFromAssociationQualifiers(map, result, type.associationQualifierMap);
    this.addBindingImportsFromPropertyList(map, result, type.aggregationList);
    this.addBindingImportsFromPropertyList(map, result, type.compositionList);
  }
  
  return result;
}


function OntologyWriter_printOntologyHeader(ontology) {
  logger.trace("printOntologyHeader " + this.ontology.prefix);
  this.println();
  this.println("<" + ontology.uri + "> a owl:Ontology " + " ;");
  this.pushIndent();
  if (ontology.label) {
    this.indent().println("rdfs:label \"" + ontology.label + "\" ;");
  }
  this.indent().println("a bind:TargetNamespace ;")
  this.indent().println("bind:suggestedPrefix \"" + ontology.prefix + "\" .");
  this.popIndent();
  
}

function OntologyWriter_printIndividuals() {
  logger.trace("printIndividuals " + this.ontology.prefix);
  var list = this.ontology.individualList;
  for (var i=0; i<list.length; i++) {
    this.println();
    var individual = list[i];
    logger.trace("printIndividual " + individual.name);
    this.indent().printQName(individual);
    this.print(" rdf:type ");
    this.printQName(individual.type);
    if (individual.documentation) {
      this.println(" ;");
      this.pushIndent();
      this.indent().print("rdfs:comment ");
      this.quote(individual.documentation);     
      this.popIndent();
    }
    this.println(" .");
  }
}

function OntologyWriter_printRdfsPrefixForBinding(ontology) {
  var list = ontology.classList;
  var rdfsNeeded = false;
  for (var i=0; i<list.length; i++) {
    var type = list[i];
    if (type.aggregationList || type.compositionList) {
      rdfsNeeded = true;
      break;
    }
  }
  if (rdfsNeeded) {
    this.println("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .");
  }
}


function OntologyWriter_printQualifiers(ontology) {
  logger.trace("OntologyWriter_printQualifiers");
  var list = ontology.qualifierList;
  for (var i=0; i<list.length; i++) {
    this.printQualifier(list[i]);
  }
}

function OntologyWriter_printQualifier(qualifier) {
  logger.trace("OntologyWriter_printQualifier");
  
  this.println();
  this.println("[] a bind:Qualifier ;");
  this.pushIndent();
  
    this.indent().print("bind:domain   ");
    this.println(qualifier.domain.ontology.prefix + ":" + qualifier.domain.name + " ;");
  
    this.indent().print("bind:property ");
    this.println(qualifier.property.ontology.prefix + ":" + qualifier.property.name + " ;");
    
    this.indent().print("bind:key      ");
    for (var i=0; i<qualifier.keyList.length; i++) {
      if (i>0) {
        this.print(", ");
      }
      var key = qualifier.keyList[i];
      this.print(key.ontology.prefix + ":" + key.name);
    }
    this.println(" .");
  
  this.popIndent();
  
}


function OntologyWriter_printRestrictions(delim, rdfClass) {
  var list = rdfClass.restrictions;
  if (!list || list.length==0) return;
  
  logger.debug("printRestrictions " + rdfClass.name + "(" + rdfClass.restrictions.length + ")");
  


  
  for (var i=0; i<list.length; i++) {
    var r = list[i];
    this.println(delim);
    this.indent().println("[ a owl:Restriction ;");
    this.pushIndent();
      this.indent().print  ("owl:onProperty      ");
      this.printQName(r.property);
      var functional = r.property.functional;
      var minCardinality = "owl:minCardinality  ";
      var maxCardinality = "owl:maxCardinality  ";
      if (r.range) {
        this.println(";");
        this.indent().print("owl:allValuesFrom  ");
        this.printQName(r.range);
      }
      if (r.minCardinality != 0) {
        this.println(";");
        this.indent().print(minCardinality);
        this.print(r.minCardinality);
        
      }
      if (r.maxCardinality != INFINITY && !functional) {
        this.println(";");
        this.indent().print(maxCardinality);
        this.print(r.maxCardinality);
      }
      if (r.comment) {
        this.println(";");
        this.indent().print("rdfs:comment ");
        this.quote(r.comment);
      }
      
      this.println();
      
    this.popIndent();
    this.indent().print("]");
  
    delim = " ,";
  }
}


/*
 * 
xlk:recommendations rdf:type rdf:Property ;
  rdfs:domain xlk:KnewtonRecommendations ;
  rdfs:range _:recommendationsList;
  
  _:recommendationsList a owl:Class;
    owl:intersectionOf (
      rdf:List
      [ a owl:Restriction;
        owl:onProperty rdf:first;
        owl:allPropertiesFrom xlk:Recommendation
      ]
      [ a owl:Restriction;
        owl:onProperty rdf:rest;
        owl:allPropertiesFrom [
          a owl:Class;
          owl:unionOf (
            _:recommendationsList
            [ a owl:Class;
              owl:oneOf( rdf:nil )
            ]
          )
        ]
      ]
    )
 */

function OntologyWriter_printPropertyAsList(property) {
  var listName = "_:" + property.name + "List";
  
  this.println();
  this.indent().println(listName + " a owl:Class;");
  this.pushIndent();
    this.indent().println("owl:intersectionOf (");
    this.pushIndent();
      this.indent().println("rdf:List");
      this.indent().println("[ a owl:Restriction;");
      this.pushIndent();
        this.indent().println("owl:onProperty rdf:first;");
        this.indent().print("owl:allValuesFrom ");
        this.printRange(property);
        this.println();
      this.popIndent();
      this.indent().println("]");
      this.indent().println("[ a owl:Restriction;");
      this.pushIndent();
        this.indent().println("owl:onProperty rdf:rest;");
        this.indent().println("owl:allValuesFrom [");
          this.pushIndent();
          this.indent().println("a owl:Class;");
          this.indent().println("owl:unionOf (");
            this.pushIndent();
              this.indent().println(listName);
              this.indent().println("[ a owl:Class;");
              this.pushIndent();
                this.indent().println("owl:oneOf ( rdf:nil )");
              this.popIndent();
              this.indent().println("]");
            this.popIndent();
          this.indent().println(")");
          this.popIndent();
        this.indent().println("]");
      this.popIndent();
      this.indent().println("]");
    this.popIndent();
    this.indent().println(") .");
  
  this.popIndent();
  
  return listName;
  
}

function OntologyWriter_printRange(property) {
  logger.debug("printRange");
  
  var list = property.rangeList;
  if (list.length == 1) {
    this.printQName(list[0]);
  } else {
    var message =
      "The property '" + property.ontology.prefix + ":" + property.name + "' has multiple " +
      "types in its range. " +
      "You should consider modifying the model so that every property " +
      "has just one type in its range.";
    
    logger.warn(message);
    this.printUnion(list);
  }
  
}

function OntologyWriter_printUnion(list) {

  this.println(" [");
  this.pushIndent();
    this.indent().println("rdf:type owl:Class ;");
    this.indent().println("owl:unionOf (");
    this.pushIndent();
      for (var i=0; i<list.length; i++) {
        this.indent().printQName(list[i]);
        this.println();     
      }
    this.popIndent();
    this.indent().println(")");
  this.popIndent();
  this.indent().print("]");
  
}

function OntologyWriter_printDomain(property) {
  logger.debug("printDomain");
  
  var list = property.domainList;
  if (list.length == 1) {
    this.printQName(list[0]);
  } else {
    this.printUnion(list);
    
  }
}

function OntologyWriter_printProperty(property) {
  logger.debug("printProperty: " + property.name);
  
  var propertyType = property.functional ? "owl:FunctionalProperty" : "rdf:Property";

  var listName = (property.stereotypeName == "List") ? this.printPropertyAsList(property) : null;
  
  
  this.println();
  this.indent().printQName(property);
  this.println(" rdf:type " + propertyType + " ;");
  this.pushIndent();
  this.indent().print("rdfs:domain ");
  this.printDomain(property);
  this.println(" ;");
  this.indent().print("rdfs:range ");
  
  if (listName) {
    this.print(listName);
  } else {
    this.printRange(property);
  }
  if (property.subPropertyOf) {
    this.println(" ;");
    this.indent().print("rdfs:subPropertyOf ");
    this.printURI(property.subPropertyOf);
  }
  if (property.inverseOf) {
    this.println(" ;");
    this.indent().print("owl:inverseOf ");
    this.printQName(property.inverseOf);
  }
  if (property.comment) {
    this.println(" ;");
    this.indent().print("rdfs:comment ");
    this.quote(property.comment);
  }
  
  this.println(" .");
  this.popIndent();
}



function OntologyWriter_printProperties() {
  logger.debug("printProperties");
  var list = this.ontology.propertyList;
  for (var i=0; i<list.length; i++) {
    this.printProperty(list[i]);
  }
}

function OntologyWriter_printURI(uri) {
  var delim = uri.lastIndexOf('#');
  if (delim < 0) delim = uri.lastIndexOf('/');
  var ontologyURI = uri.substring(0, delim);
  var localName = uri.substring(delim+1);
  
  var ont = this.ontology.universe.getRdfObject(ontologyURI);
  if (ont) {
    this.printPrefix(ont);
    this.print(localName);
  } else {
    this.print('<');
    this.print(uri);
    this.print('>');
  }
}

function OntologyWriter_printQName(obj) {
  this.printPrefix(obj.ontology);
  this.print(obj.name);
  return this;
}

function OntologyWriter_printPrefix(obj) {
  this.print(obj.prefix + ":");
  return this;
}

function OntologyWriter_printAllLists(ontology) {
  var list = ontology.listList;
  for (var i=0; i<list.length; i++) {
    this.printList(list[i]);
  }
}

function OntologyWriter_printList(listType) {
  logger.debug("printList " + listType.name);
  this.println();
  this.printQName(listType);
  this.println(" rdfs:subClassOf");
  this.pushIndent();
  this.indent().println("rdf:List,");
  this.indent().println("[ rdf:type owl:Restriction ;")
  this.pushIndent();
    this.indent().println("owl:onProperty rdf:first ;");
    this.indent().print("owl:allValuesFrom ").printQName(listType.elemType).println(" ;");
  this.popIndent();
  this.indent().println("] ,");
  this.indent().println("[ rdf:type owl:Restriction ;")
  this.pushIndent();
    this.indent().println("owl:onProperty rdf:rest ;");
    this.indent().println("owl:allValuesFrom [");
    this.indent().println("  owl:unionOf (");
    this.indent().println("    [ owl:oneOf ( rdf:nil ) ]");
    this.indent().print  ("    ").printQName(listType).println();
    this.indent().println("  )");
    this.indent().println("]");
  this.popIndent();
  this.indent().println("] .");
  this.popIndent();
  
}


function OntologyWriter_printClass(rdfClass) {
  logger.debug("printClass: " + rdfClass.uri);
  
  this.println();
  this.printQName(rdfClass);
  this.print(" rdf:type owl:Class");
  this.pushIndent();
  this.printSubClassOf(rdfClass);
  if (rdfClass.documentation) {
    this.println(" ; ");
    this.indent().print("rdfs:comment ");
    this.quote(rdfClass.documentation);
  }
  
  this.println(" .");
  this.popIndent();
  
  this.printPrimitiveSubtypes(rdfClass);
  
}

function OntologyWriter_printPrimitiveSubtypes(rdfClass) {
  logger.debug("printPrimitiveSubtypes(" + rdfClass.name + ")");
  var list = rdfClass.subTypes;
  logger.debug(!list ? "   list is null" : "list.length=" + list.length);
  if (!list) return;
  var object = rdfClass.ontology.prefix + ":" + rdfClass.name;
  for (var i=0; i<list.length; i++) {
    var type = list[i];
    logger.debug("   " + type.ontology.uri + type.name);
    if (type.ontology.uri == "http://www.w3.org/2001/XMLSchema#") {
      
      var subject = "xsd:" + type.name;
      var predicate = "owl:subClassOf";
     
      this.println(subject + " " + predicate + " " + object + " .");
      
    }
  }
}

function OntologyWriter_printSubClassOf(rdfClass) {
  logger.debug("printSubClassOf: " + rdfClass.uri);
  var superTypes = rdfClass.superTypes;
  var superLength = superTypes ? superTypes.length : 0;
  var rList = rdfClass.restrictionList;
  var rLength = rList ? rList.length : 0;
  var count = superLength + rLength;
  if (count == 0 && rdfClass.restrictions) {
    if (rdfClass.restrictions.length>0) {
      this.println(";");
      this.indent().print("rdfs:subClassOf ")
      this.printRestrictions("", rdfClass);
    }
    return;
  }
  logger.debug("supertype count: " + count);
  if (count == 0) return;
  this.println(" ;");
  this.indent().print("rdfs:subClassOf ");
  var delim = "";
  if (count > 1) {
    this.pushIndent();
  }
  if (count == 1 && superLength == 1) {
    this.printQName(superTypes[0]);
    delim = " ,";
  } else {
    for (var i=0; i<superLength; i++) {
      this.println(delim);
      this.indent().printQName(superTypes[i]);
      delim = " ,";
    }
  }
  this.printRestrictions(delim, rdfClass);
  
  if (count > 1) {
    this.popIndent();
  }
  
}


function OntologyWriter_quote(text) {
  text = this.escape(text);
  if (text.indexOf('\n') >= 0) {
    this.print('"""');
    this.print(text);
    this.print('"""');
  } else {
    this.print('"');
    this.print(text);
    this.print('"');
  }
}

function OntologyWriter_escape(text) {
  var result = "";
  for (var i=0; i<text.length; i++) {
    var c = text.charAt(i);
    var u = text.charCodeAt(i);
    if (u>127) {
      // Convert to hex
      var  hex = u.toString(16);
      // Add zero padding
      for (var j=hex.length; j<4; j++) {
        hex = '0' + hex;
      }
      c = "\\u" + hex;
    }
    if (c == '"') {
      c = '\\"';
    }
    result += c;
    
  }
  return result;
}

function OntologyWriter_printExtensibleEnum(rdfEnum) {
  logger.debug("printExtensibleEnum");
  this.printClass(rdfEnum);
}
function OntologyWriter_printEnum(rdfEnum) {
  logger.debug("printEnum " + rdfEnum.uri);
  if (rdfEnum.isExtensible) {
    this.printExtensibleEnum(rdfEnum);
    return;
  }
  
  var list = rdfEnum.individualList;
  
  this.println();
  this.indent().printQName(rdfEnum);
  this.indent().print(" a owl:Class ");
  this.pushIndent();
  this.printSubClassOf(rdfEnum);
  this.println(" ;");
  this.indent().println("owl:equivalentClass [");
  this.pushIndent();
    this.indent().println("owl:oneOf (");
    this.pushIndent();
      for (var i=0; i<list.length; i++) {
        
        this.indent().printQName(list[i]);
        if (i==(list.length-1)) {
          this.println();
        } else {
          this.println(" ");
        }
        
      }
    this.popIndent();
    this.indent().println(")");
  this.popIndent();
  this.indent().print("]");
  if (rdfEnum.documentation) {
    this.println(" ;");
    this.indent().print("rdfs:comment ");
    this.quote(rdfEnum.documentation);  
  }
  this.println(" .");
  this.popIndent();
    
  
  
}

function OntologyWriter_printEnumList() {
  logger.debug("printEnumList");
  var list = this.ontology.enumList;
  for (var i=0; i<list.length; i++) {
    this.printEnum(list[i]);
  }
}

function OntologyWriter_printClasses() {
  logger.debug("printClasses");
  var list = this.ontology.classList;
  for (var i=0; i<list.length; i++) {
    this.printClass(list[i]);
  }
}

function OntologyWriter_printBinding(onto) {
  this.ontology = onto;
  this.printRdfsPrefixForBinding(onto);
  var importList = this.computeBindingImports(onto);
  this.println("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .");
  this.println("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .");
  this.println("@prefix bind: <http://purl.org/semantictools/v1/vocab/bind#> .");
  for (var i=0; i<importList.length; i++) {
    var item = importList[i];
    this.println("@prefix " + item.prefix + ": <" + item.uri + "> .");
  }
  
  this.println();
  var propertyList = this.getBindProperties(onto);
  this.printPropertyList(onto, propertyList);
  this.printClassBindings();
  this.printEnumBindings();
  this.printQualifiers(onto);
  
}


function OntologyWriter_printPropertyList(onto, propertyList) {
  if (propertyList.length == 0) {
    return;
  }
  if (propertyList.length == 1) {

    this.println();
    this.print('<' + onto.uri + "> ")
    
    var p = propertyList[0];
    this.print(p.name);
    this.print(" <");
    this.print(p.value);
    this.println("> .");
  } else {

    this.println();
    this.println('<' + onto.uri + ">")
    this.pushIndent();
    for (var i=0; i<propertyList.length; i++) {
      var delim = (i==propertyList.length-1) ? " ." : " ;";
      var p = propertyList[i];
      this.indent();
      this.println(p.name + " <" + p.value + ">" + delim);
    }
    this.popIndent();
  }
}

function OntologyWriter_getBindProperties(onto) {
  var array = new Array();
  if (onto.orgId) {
    append(array, new PropertyValue("bind:org", onto.orgId));
  }
  if (onto.contextURI) {
    append(array, new PropertyValue("bind:jsonContext", onto.contextURI));
  }
  return array;
}

function OntologyWriter_printEnumBinding(enumType) {
  this.println();
  this.print(enumType.ontology.prefix + ":" + enumType.name);
  this.println(" rdf:type bind:Enum .");
}

function OntologyWriter_printEnumBindings() {
  logger.debug("printEnumBindings");
  var list = this.ontology.enumList;
  for (var i=0; i<list.length; i++) {
    this.printEnumBinding(list[i]);
  }
}

function OntologyWriter_printClassBindings() {
  logger.debug("printClassBindings");
  var list = this.ontology.classList;
  for (var i=0; i<list.length; i++) {
    this.printClassBinding(list[i]);
  }
}

function OntologyWriter_printClassBinding(type) {
  logger.trace("printClassBinding " + type.name + ", " + type.stereotypeName);
  if (type.isEmbeddable) {
    this.print(this.ontology.prefix + ":" + type.name);
    this.println(" rdf:type bind:EmbeddableClass .");
    
  } 
  if (type.isAddressable) {
    this.print(this.ontology.prefix + ":" + type.name);
    this.println(" rdf:type bind:Addressable .");
  }
  if (type.isEnumerable) {
    this.print(this.ontology.prefix + ":" + type.name);
    this.println(" rdf:type bind:Enum .");
  }
  
  if (type.isAbstract) {
    this.print(this.ontology.prefix + ":" + type.name);
    this.println(" rdf:type bind:AbstractClass .");
  }
  
  this.printAssociationQualifier(type);

  /*
  this.printAssociationType(type, type.aggregationList, "bind:Aggregation");
  this.printAssociationType(type, type.compositionList, "bind:Composition");
  */
  
  
}

function OntologyWriter_printAssociationQualifier(type) {
  logger.trace("OntologyWriter_printAssociationQualifier");

  var map = type.associationQualifierMap;
  if (!map) return;
  
  this.pushIndent();
  this.print(this.ontology.prefix + ":" + type.name + " rdfs:subClassOf");
  var comma = "";
  
  for (var propertyURI in map) {
    this.println(comma);
    var q = map[propertyURI];
    var property = q.rdfProperty;
    var associationType = 
      q.encapsulation == AGGREGATE ? "bind:Aggregation" :
      q.encapsulation == COMPOSITE ? "bind:Composition" :
      null;
    
    var inverseAssociationType =
      q.inverseEncapsulation == AGGREGATE ? "bind:Aggregation" :
      q.inverseEncapsulation == COMPOSITE ? "bind:Composition" :
      null;
      
    this.indent();
    this.println("[ rdf:type bind:AssociationQualifier ;");
    this.indent();
    this.print("  bind:onProperty " + property.ontology.prefix + ":" + property.name);
    if (associationType) {
      this.println(" ;");
      this.indent();
      this.print("  bind:associationType " + associationType);
    }
    
    if (inverseAssociationType) {
      this.println(" ;");
      this.indent();
      this.print("  bind:inverseAssociationType " + inverseAssociationType);
    }
    if (q.inverseMinCardinality) {
      this.println(" ;");
      this.indent();
      this.print("  bind:inverseMinCardinality " + q.inverseMinCardinality);
    }
    if (q.inverseMaxCardinality) {
      this.println(" ;");
      this.indent();
      if (q.inverseMaxCardinality == "*") {
        this.print("  bind:inverseUnboundedCardinality true");
      } else {
        this.print("  bind:inverseMaxCardinality " + q.inverseMaxCardinality);
      }
    }
    this.println();
    this.indent();
    this.print("]");
    
    
    comma = ", "
  }
  this.println(" .");
  this.popIndent();
  
  
}

/* deprecated */
function OntologyWriter_printAssociationType(type, list, associationType) {
  logger.trace("printAssociationType");
  if (list && list.length>0) {
    
    this.pushIndent();
    this.println(this.ontology.prefix + ":" + type.name + " rdfs:subClassOf");
    
    for (var i=0; i<list.length; i++) {
      var property = list[i];
      if (i>0) {
        this.println(" ,");
      }
      this.indent();
      this.println("[ rdf:type bind:AssociationQualifier ;");
      this.indent();
      this.println("  bind:onProperty " + property.ontology.prefix + ":" + property.name + " ;");
      this.indent();
      this.println("  bind:associationType " + associationType);
      this.indent();
      this.print("]");
    }
    this.println(" .");
    this.popIndent();
  }
}

function OntologyWriter_printImports() {
  logger.debug("printImports");
  var list = this.ontology.importList;

  this.addNamespace(list, new Namespace("owl",  "http://www.w3.org/2002/07/owl#"));
  this.addNamespace(list, new Namespace("rdf",  "http://www.w3.org/1999/02/22-rdf-syntax-ns#"));
  this.addNamespace(list, new Namespace("rdfs", "http://www.w3.org/2000/01/rdf-schema#"));
  this.addNamespace(list, new Namespace("xsd",  "http://www.w3.org/2001/XMLSchema#"));
  this.addNamespace(list, new Namespace("bind", "http://purl.org/semantictools/v1/vocab/bind#"));
  
  for (var i=0; i<list.length; i++) {
    var namespace = list[i];
    this.print("@prefix ");
    this.print(namespace.prefix);
    this.print(": <");
    this.print(namespace.uri);
    this.println("> .");
    
  }
  
}

function OntologyWriter_addNamespace(list, ns) {
  for (var i=0; i<list.length; i++) {
    if (list[i].uri == ns.uri) return;
  }
  append(list, ns);
}

function OntologyWriter_printOntology(ontology) {
  logger.debug("printOntology: " + ontology.uri);
  this.ontology = ontology;
  this.printImports();
  this.printOntologyHeader(ontology);
  this.printClasses();
  this.printEnumList();
  this.printAllLists(ontology);
  this.printProperties();
  this.printIndividuals();
}


RDF = new Ontology(UNIVERSE, "rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
RDF.createClass("Property");



function Ontology(universe, prefix, uri, orgId, contextURI) {
  logger.debug("new Ontology: " + uri);
  this.createClass = Ontology_createClass;
  this.universe = universe;
  this.prefix = prefix;
  this.uri = uri;
  this.orgId = orgId;
  this.label = null;
  this.contextURI = contextURI;
  this.classList = new Array();
  this.propertyList = new Array();
  this.enumList = new Array();
  this.listList = new Array();
  this.individualList = new Array();
  this.importList = new Array();
  this.qualifierList = new Array();
  universe.putRdfObject(uri, this);

}

RDFS = new Ontology(UNIVERSE, "rdfs", "http://www.w3.org/2000/01/rdf-schema#");

function Ontology_createClass(name) {
  logger.debug("createClass " + name);
  this[name] = new RdfClass(this, name);
  return this[name];
}

function AssociationQualifier(propertyURI, encapsulation) {
  this.setInverseMultiplicity = AssociationQualifier_setInverseMultiplicity;
  this.propertyURI = propertyURI;
  this.encapsulation = encapsulation;
  this.inverseEncapsulation = null;
  this.inverseMinCardinality = null;
  this.inverseMaxCardinality = null;
  this.rdfProperty = null;
}

function AssociationQualifier_setInverseMultiplicity(m) {
  logger.debug("setInverseMultiplicity: " + this.propertyURI);
  if (!m) {
    return;
  }
  if ("0..1" == m) {
    this.inverseMinCardinality = 0;
    this.inverseMaxCardinality = 1;
    
  } else if ("1" == m) {
    this.inverseMinCardinality = 1;
    this.inverseMaxCardinality = 1;
    
  } else if ("*" == m) {
    this.inverseMinCardinality = 0;
    this.inverseMaxCardinality = INFINITY;
    
  } else if ("1..*" == m) {
    this.inverseMinCardinality = 1;
    this.inverseMaxCardinality = INFINITY;
  } else {
    logger.error("Invalid inverse multiplicity: " + m); 
  }
}

function RdfClass(ontology, name, umlClass) {
  logger.debug("new RdfClass " + name);
  this.getMaxCardinalityRestriction = RdfClass_getMaxCardinalityRestriction;
  this.buildAggregationList = RdfClass_buildAggregationList;
  this.buildCompositionList = RdfClass_buildCompositionList;
  this.normalizeRestrictions = RdfClass_normalizeRestrictions;
  this.buildAssociationQualifierMap = RdfClass_buildAssociationQualifierMap;
  this.ontology = ontology;
  this.name = name;
  this.uri = ontology.uri + name;
  this.restrictions = new Array();
  this.aggregationList = null;
  this.compositionList = null;
  this.inlineList = null;
  this.superTypes = null;
  this.subTypes = null;
  this.stereotypeName = null;
  this.umlClass = umlClass;
  this.documentation = null;
  this.associationQualifierMap = null;
  
  if (umlClass) {
  
    this.isAddressable = (umlClass.stereotypeName == "addressable");
    this.isEmbeddable = (umlClass.stereotypeName == "embeddable");
    this.isEnumerable = (umlClass.stereotypeName == "enumerable");
    this.isAbstract = umlClass.isAbstract;
    this.documentation = umlClass.documentation;
    if (umlClass.uml) {
      ontology.universe.putRdfObject(umlClass.uml.Pathname, this);
    }
  } else {
    this.isAddressable = this.isEmbeddable = this.isAbstract = this.isEnumerable = false;   
  }
  
  logger.trace("appending " + name + " to " + ontology.prefix + " classList");
  append(ontology.classList, this);
  ontology.universe.putRdfObject(this.uri, this);
}

function RdfClass_normalizeRestrictions() {
  logger.debug("RdfClass_normalizeRestrictions: " + this.name);
  var array = new Array();
  var list = this.restrictions;
  for (var i=0; i<list.length; i++) {
    var r = list[i];
    
    if (r.property.stereotypeName == "List") {
      r.maxCardinality = 1;
    }
    
    var msg = "   property = " + r.property.name + ", multiplicity=[" + r.minCardinality + ".." + r.maxCardinality + "]";
    msg += ", range = " + r.range.name;
    if (!r.preserve && (r.property.rangeList.length == 1)) {
      
      /* If the range declared in the restriction is identical to the
       * range declared in the property and the restriction has no comment
       */
      
      
      r.range = null;
      msg += " ... nulled";
    }
    
    if (r.comment) {
      /* preserve restrictions that have comments on them */
      r.preserve = true;
    }
    
    if ( r.preserve ||
         ( r.property.functional && (r.range || r.minCardinality!=0)) ||
         (!r.property.functional && (r.minCardinality != 0 || r.maxCardinality != INFINITY || r.range))
    ) {
      append(array, r);
      msg += " KEEP";
     
    } else {
      msg += " DISCARD";
    }

    logger.debug(msg);
  }
  this.restrictions = array;
}

function RdfClass_buildAssociationQualifierMap() {
  logger.trace("RdfClass_buildAssociationQualifierMap");
  var extras = this.ontology.universe.classExtras[this.uri];
  if (!extras) return;
  this.associationQualifierMap = new Object();
  for (propertyURI in extras.associationQualifierMap) {
    var qualifier = extras.associationQualifierMap[propertyURI];
    qualifier.rdfProperty = this.ontology.universe.getRdfObject(propertyURI);
    this.associationQualifierMap[propertyURI] = qualifier;
  }
}

/* deprecated */
function RdfClass_buildAggregationList() {
  logger.trace("buildAggregationList " + this.name);
  var extras = this.ontology.universe.classExtras[this.uri];
  if (!extras || extras.aggregationList.length==0) return;
  var list = extras.aggregationList;
  this.aggregationList = new Array();
  for (var i=0; i<list.length; i++) {
    var propertyURI = list[i];
    var property = this.ontology.universe.getRdfObject(propertyURI);
    append(this.aggregationList, property);
    logger.trace("Aggregation Property: " + this.name + "." + property.name);
  }
}

/* deprecated */
function RdfClass_buildCompositionList() {
  logger.trace("buildCompositionList " + this.name);
  var extras = this.ontology.universe.classExtras[this.uri];
  if (!extras || extras.compositionList.length==0) return;
  
  var list = extras.compositionList;
  this.compositionList = new Array();
  for (var i=0; i<list.length; i++) {
    var propertyURI = list[i];
    var property = this.ontology.universe.getRdfObject(propertyURI);
    append(this.compositionList, property);
    logger.trace("Composition Property: " + this.name + "." + property.name);
  }
}

function RdfClass_getMaxCardinalityRestriction(propertyUri) {
  logger.debug("getMaxCardinalityRestriction " + this.name + " " + propertyUri);
  for (var i=0; i<this.restrictionList.length; i++) {
    var r = this.restrictionList[i];
    if (r.constructor == MaxQualifiedCardinality  && (r.onProperty.uri == propertyUri)) {
      return r;
    }
  }
  return null;
}

function RdfEnum(ontology, name, extensible, documentation) {
  logger.debug("new RdfEnum " + name);
  this.superTypes = null;
  this.ontology = ontology;
  this.name = name;
  this.uri = ontology.uri + name;
  this.isEnum = true;
  this.isExtensible = extensible;
  this.individualList = new Array();
  this.documentation = documentation;
  
  append(ontology.enumList, this);
  ontology.universe.putRdfObject(this.uri, this);
}

function RdfList(ontology, name, elemUML) {
  logger.debug("new RdfList " + name);
  this.ontology = ontology;
  this.uri = ontology.uri + name;
  this.name = name;
  this.elemUML = elemUML;
  this.elemType = null;
  
  ontology.universe.putRdfObject(this.uri, this);
  append(ontology.listList, this);
}



function RdfIndividual(ontology, name, type, documentation) {
  logger.debug("new RdfIndividual " + name);
  this.ontology = ontology;
  this.name = name;
  this.uri = ontology.uri + name;
  this.type = type;
  this.documentation = documentation;
}

function RdfProperty(ontology, name, umlField) {
  logger.debug("new RdfProperty " + name);
  if (!ontology) {
    logger.error("ontology is not defined for property '" + name + "'");
    return;
  }
  this.removeDuplicates = RdfProperty_removeDuplicates;
  this.normalize = RdfProperty_normalize;
  this.setType = RdfProperty_setType;
  this.ontology = ontology;
  this.name = name;
  this.uri = ontology.uri + name;
  this.stereotypeName = umlField ? umlField.stereotypeName : null; 
  this.functional = false;
  this.inverseOf = null;
  this.umlField = umlField;
  this.subPropertyOf = umlField ? umlField.subPropertyOf : null;
  this.comment = umlField ? umlField.description : null;
  logger.debug("   comment=" + this.comment);
  
  this.type = RDF.Property;
  this.attrCount = 0; /*  The number of times that this property appears as an attribute in the XSD binding */
  
  this.usage = new Array();
  this.domainList = new Array();
  this.rangeList = new Array();

  ontology.universe.putRdfObject(this.uri, this);
  append(ontology.propertyList, this);
  logger.trace("end RdfProperty constructor");
  
}
function RdfProperty_setType() {
  
}

function RdfProperty_normalize() {
  logger.debug("normalize: " + this.uri);
  this.domainList = this.removeDuplicates(this.domainList);
  this.rangeList = this.removeDuplicates(this.rangeList);
  
  this.setType();

  // If all uses of this property have maxCardinality=1, then
  // this property is functional.
  var list = this.usage;
  var functional = true;
  for (var i=0; i<list.length; i++) {
    var r = list[i];
    if (r.maxCardinality != 1) {
      functional = false;
      break;
    }
  }
  this.functional = functional;
  
}

/*
 * Returns a list that is the same as the given list, except that duplicates are
 * removed.
 */
function RdfProperty_removeDuplicates(list) {
  if (list.length < 2) return list;
  var set = new Object();
  for (var i=0; i<list.length; i++) {
    set[ list[i].uri ] = list[i];
  }
  list = new Array();
  for (var key in set) {
    append(list, set[key]);
  }
  return list;
  
}

function Qualifier(property, domain) {
  this.property = property;
  this.domain = domain;
  this.keyList = new Array();
}

function RdfRestriction(property, domain, range, minCardinality, maxCardinality, comment) {
  this.comment = comment;
  this.property = property;
  this.domain = domain;
  this.range = range;
  this.minCardinality = minCardinality;
  this.maxCardinality = maxCardinality;
  this.preserve = false;
}


function PropertyRestriction(onProperty) {
  this.onProperty = onProperty;
}

function Statement(subject, predicate, object) {
  logger.debug("new Statement " + subject.name + "->(" + predicate.name + ")->" + object.name);
  this.subject = subject;
  this.predicate = predicate;
  this.object = object;
  
}


function PropertyBuilder(universe, ontBuilder) {
  this.universe = universe;
  this.ontBuilder = ontBuilder;
  
  /* TODO: eliminate newOntologyList */
  
  this.newOntologyList = new Array();
  this.superPropertyMap = new Object();
  
  this.scanAll = PropertyBuilder_scanAll;
  this.scanOntology = PropertyBuilder_scanOntology;
  this.handleSuperProperty = PropertyBuilder_handleSuperProperty;
  this.rangeContains = PropertyBuilder_rangeContains;
  this.computeImports = PropertyBuilder_computeImports;
  this.normalize = PropertyBuilder_normalize;
  
}

function PropertyBuilder_normalize(ont) {
  var list = ont.propertyList;
  for (var i=0; i<list.length; i++) {
    var p = list[i];
    p.normalize();
  }
}

function PropertyBuilder_computeImports() { 
  logger.trace("PropertyBuilder_computeImports");
  var list = this.newOntologyList;
  for (var i=0; i<list.length; i++) {
    var ont =  list[i];
    this.normalize(ont);
  }
}


function PropertyBuilder_scanAll() {
  var list = this.universe.ontologyList;
  for (var i=0; i<list.length; i++) {
    var ontology = list[i];
    this.scanOntology(ontology);
  }
}

function PropertyBuilder_scanOntology(ontology) {
  var list = ontology.propertyList;
  for (var i=0; i<list.length; i++) {
    var p = list[i];
    if (p.subPropertyOf) {
      this.handleSuperProperty(p);
    }
  }
}

function PropertyBuilder_handleSuperProperty(subProperty) {
  var uri = subProperty.subPropertyOf;
  var delim = uri.lastIndexOf('#');
  if (delim < 0) delim = uri.lastIndexOf('/');
  
  var ontologyURI = uri.substring(0, delim+1);
  var localName = uri.substring(delim+1);
  
  var onto = this.universe.getRdfObject(ontologyURI);
  if (!onto) {
    var slash = ontologyURI.lastIndexOf('/');
    var prefix = ontologyURI.substring(slash+1, ontologyURI.length-1);
    onto = new Ontology(this.universe, prefix, ontologyURI);
    /* Mark the new ontology as synthetic
     * This means that the ontology does not appear explicitly in the UML, and
     * we are synthesizing the ontology based on annotations only
     */
    onto.synthetic = true;
    append(this.universe.ontologyList, onto);
    append(this.newOntologyList, onto);
  }
  
  var p = this.universe.getRdfObject(uri);
  if (!p) {
    p = new RdfProperty(onto, localName);
    
    
    /* mark the new property as synthetic.
     * This means that property does not appear explicitly in the UML, and
     * we are synthesizing the property based on annotations only.
     */
    p.synthetic = true;
    
    var thing = this.universe.getThing();
    
    append(p.domainList, thing);
    
    /* Add all elements of the subProperty range to the superProperty range */
    var list = subProperty.rangeList;
    for (var i=0; i<list.length; i++) {
      append(p.rangeList, list[i]);
    }
    if (p.rangeList.length > 1 ) {
      throw "Multiple elements in range not supported";
    }   
    
  } else if (p.synthetic) {
      /* Add new elements to the range, but don't duplicate any that already exist */
    var list = subProperty.rangeList;
    for (var i=0; i<list.length; i++) {
      var r = list[i];
      if (!this.rangeContains(p.rangeList, r.uri)) {
        append(p.rangeList, r);
      }
    }
  }
  
}

function PropertyBuilder_rangeContains(list, uri) {
  for (var i=0; i<list.length; i++) {
    if (uri == list[i].uri) return true;
  }
  return false;
}

function OntologyBuilder(universe) {
  this.buildAll = OntologyBuilder_buildAll;
  this.buildOntology = OntologyBuilder_buildOntology;
  this.buildClass = OntologyBuilder_buildClass;
  this.buildProperties = OntologyBuilder_buildProperties;
  this.buildIndividuals = OntologyBuilder_buildIndividuals;
  this.createProperties = OntologyBuilder_createProperties;
  this.createProperty = OntologyBuilder_createProperty;
  this.buildEnums = OntologyBuilder_buildEnums;
  this.computeImportedOntologies = OntologyBuilder_computeImportedOntologies;
  this.addImport = OntologyBuilder_addImport;
  this.normalizeProperties = OntologyBuilder_normalizeProperties;
  this.buildClassHierarchy = OntologyBuilder_buildClassHierarchy;
  this.buildAllProperties = OntologyBuilder_buildAllProperties;
  this.setSuperTypes = OntologyBuilder_setSuperTypes;
  this.buildQualifiers = OntologyBuilder_buildQualifiers;
  this.buildAllQualifiers = OntologyBuilder_buildAllQualifiers;
  this.finishAllClasses = OntologyBuilder_finishAllClasses;
  this.finishClasses = OntologyBuilder_finishClasses;
  this.assignInverseProperties = OntologyBuilder_assignInverseProperties;
  this.setListElemTypes = OntologyBuilder_setListElemTypes;
  this.normalizeAllRestrictions = OntologyBuilder_normalizeAllRestrictions;
  this.getNamespace = OntologyBuilder_getNamespace;
  this.getLocalName = OntologyBuilder_getLocalName;
  this.buildImports = OntologyBuilder_buildImports;
  this.addOntologyImportsFromList = OntologyBuilder_addOntologyImportsFromList;
  this.setSubtypes = OntologyBuilder_setSubtypes;
  
  this.universe = universe;
  this.ontology = null;
  this.umlClassMap = new Object();
  
}

function OntologyBuilder_buildImports() {
  var list = this.universe.ontologyList;
  for (var i=0; i<list.length; i++) {
    this.computeImportedOntologies(list[i]);
  }
}

function OntologyBuilder_getNamespace(uri) {
  var hash = uri.lastIndexOf('#');
  var slash = uri.lastIndexOf('/');
  var delim = hash > slash ? hash : slash;
  return uri.substring(0, delim+1);
}

function OntologyBuilder_getLocalName(uri) {

  var hash = uri.lastIndexOf('#');
  var slash = uri.lastIndexOf('/');
  var delim = hash > slash ? hash : slash;
  return uri.substring(delim+1);
}

function OntologyBuilder_buildIndividuals(pkg, ontology) {
  for (var i=0; i<pkg.individualList.length; i++) {
    var umlObject = pkg.individualList[i];
    
    var name = umlObject.Name;
    var classifier = umlObject.Classifier;
    var path = classifier.Pathname;
    var type = this.universe.getRdfObject(path);
    var documentation = umlObject.documentation;
    var individual = new RdfIndividual(ontology, name, type, documentation);
    ontology.universe.putRdfObject(individual.uri, individual);
    append(ontology.individualList, individual);
    
  }
}


function OntologyBuilder_buildQualifiers(pkg, ontology) {
  var list = pkg.qualifierList;
  for (var i=0; i<list.length; i++) {
    var q = list[i];
    
    var domainURI = q.domain.uri;
    var range = q.property.type;
    var propertyURI = q.property.uri;
    
    var rdfDomain = this.universe.getFacet("rdf", domainURI);
    var rdfProperty = this.universe.getFacet("rdf", propertyURI);
    
    if (!rdfDomain) {
      logger.error("rdf domain not found: " + domainURI);
      continue;
    }
    if (!rdfProperty) {
      logger.error("rdf property not found: uri=" + propertyURI + ", fieldName=" + q.property.name);
      continue;
    }
    
    var qualifier = new Qualifier(rdfProperty, rdfDomain);
    
    for (var j=0; j<q.keyList.length; j++) {
      var keyName = q.keyList[i];
      var keyField = range.getFieldByName(keyName);
      if (!keyField) {
        logger.error("Key not found: " + keyName);
        continue;
      }
      var keyURI = keyField.uri;
      var keyProperty = this.universe.getFacet("rdf", keyURI);
      if (!keyProperty) {
        logger.error("key rdf property not found: uri=" + keyURI + ", fieldName=" + keyName);
        continue;
      }
      append(qualifier.keyList, keyProperty);
    }
    
    if (qualifier.keyList.length > 0) {
      append(ontology.qualifierList, qualifier);
    }
    
    
  }
}


function OntologyBuilder_finishAllClasses() {
  logger.trace("finishAllClasses");
  var list = this.universe.ontologyList;
  for (var i=0; i<list.length; i++) {
    var ontology = list[i];
    
    this.finishClasses(ontology);
    this.setListElemTypes(ontology);
  }
}

function OntologyBuilder_finishClasses(ontology) {
  logger.trace("finishClasses " + ontology.prefix);
  var list = ontology.classList;

  logger.debug("enumList.length=" + ontology.enumList.length);
  for (var i=0; i<ontology.enumList.length; i++) {
    this.setSuperTypes(ontology.enumList[i].umlEnum);
  }
  
  for (var i=0; i<list.length; i++) {
    list[i].buildAssociationQualifierMap();
    /* deprecated
    list[i].buildCompositionList();
    list[i].buildAggregationList();
    */
  }
}

function OntologyBuilder_buildAllQualifiers() {
  logger.trace("OntologyBuilder_buildAllQualifiers");
  for (var i=0; i<this.universe.ontologyList.length; i++) {
    var ontology = this.universe.ontologyList[i];
    var pkg = this.universe.getUmlObject(ontology.uri);
    if (!pkg) {
      logger.error("Package not found: " + ontology.uri);
    }
    this.buildQualifiers(pkg, ontology);
    this.buildIndividuals(pkg, ontology);
  }
}

function OntologyBuilder_buildAllProperties() {
  logger.debug("buildAllProperties");
  this.propertyList = new Array();
  for (var i=0; i<this.universe.ontologyList.length; i++) {
    this.ontology = this.universe.ontologyList[i];
    this.buildProperties();
  }
  this.assignInverseProperties();
  this.propertyList = null;
}

function OntologyBuilder_assignInverseProperties() {
  for (var i=0; i<this.propertyList.length; i++) {
    var p = this.propertyList[i];
    var field = p.umlField;
    if (!field) {
      logger.warn("Field not defined: " + p.uri);
      continue;
    } 
    if (field.inverseOf) {
      p.inverseOf = this.universe.getRdfObject(field.inverseOf.uri);
    }
  }
}

function OntologyBuilder_setSuperTypes(umlClass) {
  logger.debug("setSuperTypes " + umlClass.name);
  if (umlClass.constructor == SimpleType) {
    logger.debug("skipping supertypes for SimpleType " + umlClass.name);
    return;
  }
  var list = umlClass.superTypes;
  if (!list || list.length==0) return;
  var rdfClass = umlClass.rdfClass;
  
  if (!rdfClass) return;
  
  if (!rdfClass.superTypes) {
    rdfClass.superTypes = new Array();
  }

  for (var i=0; i<list.length; i++) {
    logger.debug(i + ". " + list[i].name);
  }
  for (var i=0; i<list.length; i++) {
    var superType = list[i].rdfClass;
    if (!superType) {
      throw "RDF class not defined: " + list[i].name;
    }
    append(rdfClass.superTypes, superType);
  }
  
  logger.debug("END setSupertypes");
}

function OntologyBuilder_setSubtypes(umlClass) {
  logger.debug("setSubtypes " + umlClass.name);
  return;
  var rdfClass = umlClass.rdfClass;
  if (!rdfClass) return;
  
  var list = umlClass.subTypes;
  if (!list) {
    logger.debug("   No subtypes recorded.");
  } else {
    if (!rdfClass.subTypes) {
      rdfClass.subTypes = new Array();
    }
    for (var i=0; i<list.length; i++) {
      logger.debug("   " + list[i].uri);
      
      logger.debug("   getRdfObject");
      var subtype = this.universe.getRdfObject(list[i].uri);
      logger.debug("   got Rdf Object");
    
      if (!subtype) {
        throw "RDF class not defined: " + list[i].name;
      }
      append(rdfClass.subTypes, subtype);
    }
  }
}

function OntologyBuilder_buildClassHierarchy() {
  logger.debug("buildClassHierarchy");
  
  var map = this.umlClassMap;
  for (var key in map) {
    var umlClass = map[key];
    this.setSuperTypes(umlClass);
    this.setSubtypes(umlClass);
  }
  
  this.finishAllClasses();
}

function OntologyBuilder_normalizeProperties() {
  logger.debug("normalizeProperties");
  var list = this.ontology.propertyList;
  for (var i=0; i<list.length; i++) {
    list[i].normalize();
  }
}

function OntologyBuilder_addOntologyImportsFromList(map, list) {
  for (var i=0; i<list.length; i++) {
    this.addImport(map, list[i].ontology);
  }
}

function OntologyBuilder_computeImportedOntologies(ont) {
  logger.debug("computeImportedOntologies for " + ont.uri);
  this.ontology = ont;
  ont.importList = new Array();
  var map = new Object();
  var list = ont.propertyList;
  this.addImport(map, ont);
  for (var i=0; i<list.length; i++) {
    var property = list[i];
    this.addOntologyImportsFromList(map, property.domainList);
    this.addOntologyImportsFromList(map, property.rangeList);
    
    for (var j=0; j<property.usage.length; j++) {
      var restriction = property.usage[j];
      var domain = restriction.domain;
      var range = restriction.range;
      if (domain && domain.ontology) {
        this.addImport(map, domain.ontology);
      }
      if (range && range.ontology) {
        this.addImport(map, range.ontology);
      }
      
    }
    
  }
  
  list = ont.classList;
  logger.debug("Add imports for supertypes");
  for (var i=0; i<list.length; i++) {
    var type = list[i];
    if (type.superTypes) {
      for (var j=0; j<type.superTypes.length; j++) {
        var s = type.superTypes[j];
        this.addImport(map, s.ontology);
      }
    }
    logger.debug("Compute imports for restrictions on " + type.name);
    var rlist = type.restrictions;
    if (!rlist) continue;
    for (var j=0; j<rlist.length; j++) {
      var r = rlist[j];
      var domain = r.domain;
      var range = r.range;
      var property = r.property;

      if (domain && domain.ontology) {
        this.addImport(map, domain.ontology);
      }
      if (range && range.ontology) {
        this.addImport(map, range.ontology);
      }
      if (property && property.ontology) {
        this.addImport(map, property.ontology);
      }
    }
  }
  
  list = ont.individualList;
  logger.debug("Add imports for individuals");
  for (var i=0; i<list.length; i++) {
    var n = list[i];
    this.addImport(map, n.type.ontology);
  }
  
  logger.debug("end computeImportedOntologies");
  
}

function OntologyBuilder_addImportsFromRestrictions(map, type) {
  
}

function OntologyBuilder_addImport(map, namespace) {
  logger.debug("begin OntologyBuilder_addImport ");
  logger.assert(namespace, "namespace is not defined");
  var uri = namespace.uri;
  if (!map[uri]) {
    logger.debug("imported namespace: " + uri);
    map[uri] = uri;
    append(this.ontology.importList, namespace);
  }
  logger.debug("end OntologyBuilder_addImport");
}

function OntologyBuilder_createProperty(rdfClass, field) {
  logger.debug("createProperty " + rdfClass.name + "." + field.name);
  
  var type = field.type;
  if (!type) {
    logger.error("Type not defined for field: " + rdfClass.name + "." + field.name);
  }
  var typeURI = type.uri;
  if (!typeURI) {
    logger.error("Type uri not defined for field: "  + rdfClass.name + "." + field.name);
  }

  
  
  if (field.stereotypeName == "ident") {
    logger.debug("Ignoring field " + rdfClass.name + "." + field.name + " because it is an identity field");
    return;
  }

  var universe = this.ontology.universe;
  
  var property = null;
  var name = field.name;
//  var uri = this.ontology.uri + name;
  var uri = field.uri;
  if (!uri) {
    uri = this.ontology.uri + name;
  }
  var namespaceURI = this.getNamespace(uri);
  var ontology = universe.getRdfObject(namespaceURI);
  var localName = this.getLocalName(uri);
  if (localName != name) {
    logger.error("The localName '" + name + "' of this property is not consistent with the URI: " + uri);
  }
  
  var prior = universe.getRdfObject(uri);
  if (prior && (prior.constructor == RdfProperty)) {
    property = prior;
  } else if (prior) {
    logger.error("Name conflict " + uri);
    throw "Aborting code generation";
    
  } else {
    property = new RdfProperty(ontology, name, field);
    append(this.propertyList, property);
    /* TODO:  Shouldn't the stereotype be set on the property?  not on this OntologyBuilder! */
    this.stereotypeName = field.stereotypeName;
  }
  var objectUri = field.type.uri;
  var object = universe.getRdfObject(objectUri);
  if (!object) {
    logger.error("type not found for field: " + rdfClass.name + "." + field.name + "->" + objectUri);
    return;
  }

  
  if (field.stereotypeName == "list") {
    var listURI = objectUri + "List";
    var listName = object.name + "List";
    var listType = universe.getRdfObject(listURI);
    if (listType == null) {
      listType = new RdfList(object.ontology, listName, null);
      listType.elemType = object;
    }
    object = listType;
  }
  
  
  var subject = rdfClass;
  if (field.domainURI) {
    subject = universe.getRdfObject(field.domainURI);
    if (subject == null) {
      logger.error("Domain is declared for field " + rdfClass.name + "." + field.name + ", but domain class does not exist: " + domainURI);
      throw "ERROR";
    }
  }
  
  var domain = subject;
  var range = object;
  var minCardinality = field.minCardinality;
  var maxCardinality = field.maxCardinality;
  var comment = field.description;
  
  var restriction = new RdfRestriction(property, domain, range, minCardinality, maxCardinality, comment);
  if (field.preserveRestriction) {
    restriction.preserve = true;
  }
  
  append(property.usage, restriction);
  append(domain.restrictions, restriction);
  
  append(property.domainList, domain);
  append(property.rangeList, range);
  
  
  
  
}

function OntologyBuilder_buildEnums(umlPackage) {
  logger.debug("buildEnums");
  var list = umlPackage.enumList;
  for (var i=0; i<list.length; i++) {
    var umlEnum = list[i];
    var rdfEnum = new RdfEnum(this.ontology, umlEnum.name, umlEnum.isExtensible, umlEnum.documentation);
    umlEnum.rdfClass = rdfEnum;
    rdfEnum.umlEnum = umlEnum;
    this.universe.putRdfObject(umlEnum.Pathname, rdfEnum);
    for (var j=0; j<umlEnum.literalList.length; j++) {
      var value = umlEnum.literalList[j].name;
      var individual = new RdfIndividual(this.ontology, value, rdfEnum);
      append(rdfEnum.individualList, individual);
      if (umlEnum.isExtensible) {
        append(this.ontology.individualList, individual);
      }
    }
    
  }
}

function OntologyBuilder_createProperties(rdfClass) {
  logger.debug("createProperties from " + rdfClass.name);

  var umlClass = this.universe.getUmlObject(rdfClass.uri);
  
  if (!umlClass) return;
  var fieldList = umlClass.fieldList;
  if (!fieldList) return;
  
  for (var i=0; i<fieldList.length; i++) {
    var field = fieldList[i];
    this.createProperty(rdfClass, field);
  }
  logger.debug("end createProperties from " + rdfClass.name);
}

function OntologyBuilder_buildProperties() {
  logger.debug("buildProperties");
  
  var classList = this.ontology.classList;
  for (var i=0; i<classList.length; i++) {
    var rdfClass = classList[i];
    if (rdfClass.constructor == RdfClass) {
      this.createProperties(rdfClass);
    }
  }
  this.normalizeProperties();
}

function OntologyBuilder_buildClass(type) {
  logger.debug("buildClass " + type.name);
  var stereotype = type.stereotypeName;
  if ("datatype" == stereotype) return; /* The type represents a native XSD datatype */
  
  if (stereotype == "enumeration") {
    type.rdfEnum = new RdfEnum(this.ontology, type.name, true, type.documentation);
    this.universe.putRdfObject(type.uml.Pathname, type.rdfEnum);
    return;
  }
  
  if (stereotype == "List") {
    var list = new RdfList(this.ontology, type.name, type.elemType);
    return;
  }
  
  type.rdfClass = new RdfClass(this.ontology, type.name, type);
  type.rdfClass.stereotypeName = stereotype;
  this.umlClassMap[type.rdfClass.uri] = type;
}

function OntologyBuilder_setListElemTypes(ontology) {
  logger.debug("setListElemTypes: " + ontology.prefix);
  var list = ontology.listList;
  for (var i=0; i<list.length; i++) {
    var type = list[i];
    if (type.elemUML) {
      type.elemType = ontology.universe.getRdfObject(type.elemUML.uri);
      logger.debug("Element type of " + type.name + ": " + type.elemType.name);
    }
  }
}

function OntologyBuilder_buildOntology(pkg) {
  if (pkg.name == "xsd") return;
  if (pkg.name == "rdf") return;
  logger.debug("buildOntology: " + pkg.name);
  
  var onto = new Ontology(this.universe, pkg.prefix, pkg.uri, pkg.orgId, pkg.contextURI);
  onto.label = pkg.name;
  append(this.universe.ontologyList, onto);
  this.ontology = onto;
  
  logger.trace("number of uml classes = " + pkg.classList.length);

  for (var i=0; i<pkg.classList.length; i++) {
    var type = pkg.classList[i];
    logger.debug(i + ". " + type.name);
  }
  for (var i=0; i<pkg.classList.length; i++) {
    var type = pkg.classList[i];
    /*
     * This is a workaround to fix a mysterious defect.
     * Sometimes, a package can end up with a duplicate of a given ClassType.
     * We really need to fix the root cause, but for now, just check for
     * duplicates.
     */
    var typeUri = type.uri;
    var prior = this.universe.getRdfObject(typeUri);
    if (prior) {
      logger.warn("Skipping class that appears to be a duplicate: " + typeUri);
      continue;
    }
    /* end workaround */
    
    this.buildClass(type);
  }
  this.buildEnums(pkg);
  
}
function OntologyBuilder_buildAll() {
  logger.debug("buildAll");
  this.propertyMap = new Object();
  for (var i=0; i<this.universe.packageList.length; i++) {
    var pkg = this.universe.packageList[i];
    this.buildOntology(pkg);
  }
  this.buildAllProperties();
  this.buildClassHierarchy();
  this.buildAllQualifiers();
  var builder = new PropertyBuilder(this.universe, this);
  builder.scanAll();
  builder.computeImports();
  this.normalizeAllRestrictions();
  this.buildImports();
  
  
}

function OntologyBuilder_normalizeAllRestrictions() {
  logger.debug("OntologyBuilder_normalizeAllRestrictions");
  var olist = this.universe.ontologyList;
  for (var i=0; i<olist.length; i++) {
    var ont = olist[i];
    var clist = ont.classList;
    for (var j=0; j<clist.length; j++) {
      var c = clist[j];
      c.normalizeRestrictions();
    }
  }
}

function XsdBuilder(universe) {
  logger.debug("new XsdBuilder");
  this.universe = universe;
  this.buildAll = XsdBuilder_buildAll;
  this.computeImportedSchemas = XsdBuilder_computeImportedSchemas;
  this.resolveElementTypes = XsdBuilder_resolveElementTypes;
  this.buildSequences = XsdBuilder_buildSequences;
  this.buildHierarchy = XsdBuilder_buildHierarchy;
  this.buildEnums = XsdBuilder_buildEnums;
  this.resolveAll = XsdBuilder_resolveAll;
  this.filterElements = XsdBuilder_filterElements;
  
}

function XsdBuilder_buildEnums(schema) {
  logger.debug("XsdBuilder_buildEnums " + schema.prefix);
  var list = schema.ontology.enumList;
  logger.trace("enum count: " + list.length);
  for (var i=0; i<list.length; i++) {
    var e = list[i];
    new XsdEnum(e, schema);
  }
  
}

function XsdBuilder_buildHierarchy(type) {
  logger.debug("XsdBuilder buildHierarchy " + type.name);
  if (!type.rdfClass) return;
  var list = type.rdfClass.superTypes;
  if (!list) return;
  
  var ok = logger.assert(list.length < 2, "Multiple Inheritence not supported yet: " + type.name);
  if (!ok) return;
  
  if (list.length == 1) {
    var rdfSuper = list[0];
    logger.debug("super type: " + rdfSuper.name);
    
    type.extensionBase = type.schema.universe.getXsdObject(rdfSuper.uri + ".Type");
    logger.assert(type.extensionBase, "XSD representation of supertype not found");
  }
  
}

function XsdBuilder_buildSequences(schema) {
  logger.debug("XsdBuilder buildSequences " + schema.prefix);
  var list = schema.complexTypeList;
  for (var i=0; i<list.length; i++) {
    list[i].buildSequence();
    this.buildHierarchy(list[i]);
  }
  
  logger.debug("end XsdBuilder buildSequences");
  
}

/*
 * Some rdfProperties may be represented as attributes.
 * We need to filter out the corresponding elements for those
 * properties.
 */
function XsdBuilder_filterElements() {
  var list = this.universe.xsdSchemaList;
  for (var i=0; i<list.length; i++) {
    var schema = list[i];
    var elist = schema.elementList;
    var filteredList = new Array();
    for (var j=0; j<elist.length; j++) {
      var e = elist[j];
      
      if (e.rdfProperty && (e.rdfProperty.attrCount == e.rdfProperty.rangeList.length)) {
        logger.trace("filtering element " + e.uri);
        continue;
      }
      append(filteredList, e);
    }
    schema.elementList = filteredList;
  }
}
function XsdBuilder_resolveAll() {
  logger.debug("XsdBuilder resolveAll");
  var list = this.universe.xsdSchemaList;
  for (var i=0; i<list.length; i++) {
    var schema = list[i];
    
    this.resolveElementTypes(schema);
    this.buildSequences(schema);
  }
  logger.debug("end XsdBuilder resolveAll");
  
}

function XsdBuilder_resolveElementTypes(schema) {
  logger.debug("XsdBuilder resolveElementTypes");
  var list = schema.elementList;
  for (var i=0; i<list.length; i++) {
    
    var elem = list[i];
    if (elem.type) continue;
    
    var rangeList = elem.rdfProperty.rangeList;
    var ok = logger.assert(rangeList.length == 1, "expecting one item in range of " + elem.uri);
    if (!ok) {
      if (rangeList.length == 0) {
        logger.debug("The range is empty");
      } else {
        
        for (var j=0; j<rangeList.length; j++) {
          logger.debug("Range includes " + rangeList[j].uri);
        }
        var domainList = elem.rdfProperty.domainList;
        for (var j=0; j<domainList.length; j++) {
          logger.debug("Domain includes " + domainList[j].uri);
        }
      }
    }
    
    var rdfType = rangeList[0];
    var ontology = rdfType.ontology;
    
    var xsdType = null;
    
    logger.trace("resolving type: " + rdfType.uri);
    
    if ("http://www.w3.org/2001/XMLSchema#" == ontology.uri) {
      xsdType = rdfType;
      logger.trace("using XSD primitive");
    } else {
      xsdType = schema.universe.getXsdObject(rdfType.uri + ".Type");
      if (!xsdType) {
        xsdType = schema.universe.getXsdObject(rdfType.uri);
      }
      
      if (!xsdType) {
        logger.error("xsd type for element " + elem.uri + " is not found.");
      } else {
        logger.trace("found custom type");
      }
    }
    
    elem.type = xsdType;
    
  }
  logger.debug("end resolveElementTypes");
  
}

function XsdBuilder_computeImportedSchemas() {
  logger.debug("XsdBuilder computeImportedSchemas");
  var list = this.universe.xsdSchemaList;
  for (var i=0; i<list.length; i++) {
    list[i].findImportedSchemas();
  }
  /*
  for (var i=0; i<this.universe.ontologyList.length; i++) {
    var onto = this.universe.ontologyList[i];
    var targetSchema = this.universe.getXsdObject(onto.uri);
    this.buildEnums(targetSchema);
    logger.trace("computing imported schemas for " + onto.prefix);
    var set = new Object();
    set[onto.uri] = onto.uri;
    var importList = onto.importList;
    logger.trace("import list size: " + importList.length);
    for (var j=0; j<importList.length; j++) {
      var uri = importList[i].uri;
      if (set[uri]) continue;
      set[uri] = uri;
      var importedSchema = this.universe.getXsdObject(uri);
      if (!importedSchema) {
        logger.error("Imported schema not found: " + importList[i].uri);
      }
      
      append(targetSchema.importedSchemaList, importedSchema);
    }
  }
  */
  logger.debug("end computeImportedSchemas");
}
function XsdBuilder_buildAll() {
  logger.debug("XsdBuilder buildAll");

  logger.trace("Ontology count: " + this.universe.ontologyList.length);
  
  for (var i=0; i<this.universe.ontologyList.length; i++) {
    var onto = this.universe.ontologyList[i];
    var schema = new XsdSchema(onto);
    this.buildEnums(schema);
  }
  this.resolveAll();
  this.filterElements();
  this.computeImportedSchemas();
  logger.debug("end XsdBuilder buildAll");
}

function XsdSequenceElement(ref, name, type, maxOccurs, complexType) {
  logger.debug("new XsdSequenceElement ");
  this.ref = ref;
  this.name = name;
  this.type = type;
  this.maxOccurs = maxOccurs;
  this.complexType = complexType;
  
  append(complexType.sequence, this);
}

function XsdEnum(rdfEnum, schema) {
  logger.debug("new XsdEnum " + rdfEnum.name);
  this.schema = schema;
  this.rdfEnum;
  this.literalList = rdfEnum.individualList;
  this.name = rdfEnum.name + ".Type";
  this.uri = schema.uri + this.name;
  
  schema.universe.putXsdObject(this.uri, this);
  append(schema.enumList, this);
}

function XsdElement(uri, name, type, schema, rdfProperty) {
  logger.debug("new XsdElement " + name);
  this.uri = uri;
  this.name = name;
  this.type = type;
  this.schema = schema;
  this.rdfProperty = rdfProperty;
  
  
  append(schema.elementList, this);
  schema.universe.putXsdObject(this.uri, this);

  logger.debug("end XsdElement constructor");
}

function XsdAnyAttribute(namespace, processContents) {
  this.namespace = namespace;
  this.processContents = processContents;
}

function XsdAttribute(name, type, schema) {
  logger.debug("new XsdAttribute " + name);
  this.name = name;
  this.type = type;
  this.schema = schema;
}

function XsdAttributeGroup(name, schema) {
  this.name = name;
  this.schema = schema;
  this.attributeList = new Array();
  append(schema.attributeGroupList, this);
}

function XsdComplexType(rdfClass, xsdSchema) {
  logger.debug("new XsdComplexType " + rdfClass.name);
  this.buildSequence = XsdComplexType_buildSequence;
  this.assignOrdinals = XsdComplexType_assignOrdinals;
  this.sortSequence = XsdComplexType_sortSequence;
  this.rdfClass = rdfClass;
  this.name = rdfClass.name + ".Type";
  this.uri = xsdSchema.uri + this.name;
  this.schema = xsdSchema;
  this.attributeList = new Array();
  this.sequence = new Array();
  this.stereotypeName = rdfClass.stereotypeName;
  this.attributeGroupList = new Array();
  this.extensionBase = null;
  this.valueType = null;
  append(xsdSchema.complexTypeList, this);
  xsdSchema.universe.putXsdObject(this.uri, this);
  logger.debug("end XsdComplexType constructor");
}

function sortElement(a, b) {
  return a.ordinal - b.ordinal;
}

function XsdComplexType_sortSequence() {
  this.sequence.sort(sortElement);
}

function XsdComplexType_assignOrdinals() {
  logger.debug("assignOrdinals " + this.name);
  var umlClass = this.rdfClass.umlClass;
  if (!umlClass) return false;
  var map = new Object();
  for (var i=0; i<this.sequence.length; i++) {
    var e = this.sequence[i];
    map[e.name] = e;
  }
  var list = umlClass.fieldList;
  for (var i=0; i<list.length; i++) {
    var field = list[i];
    logger.trace("field " + field.name + " " + field.ordinal);
    var e = map[field.name];
    if (e) {
      e.ordinal = field.ordinal;
    }
  }
  return true;
}

function XsdComplexType_buildSequence() {
  logger.debug("begin buildSequence " + this.uri);
  logger.error("This method needs to be rewritten because propertyStatements list no longer exists");
//  
//  var list = this.rdfClass.propertyStatements;
//  var universe = this.schema.universe;
//  
//  for (var i=0; i<list.length; i++) {
//    var statement = list[i];
//    if (statement.subject != this.rdfClass) continue;
//    
//    var property = statement.predicate;
//    var ref = null;
//    var name = property.name;
//    var type = null;
//    var isAttr = statement.isXmlAttribute;
//    
//    if (statement.field && statement.field.visibility == PACKAGE) {
//      logger.trace("skipping statement for " + statement.field.name + " because it has PACKAGE visibility");
//      continue;
//    } 
//    
//    if (statement.field && statement.field.isXmlValue) {
//      this.valueType = statement.field.type;
//      logger.trace("skipping statement for " + statement.field.name + " because it represents simpleContent");
//      continue;
//    }
//    
//    if (isAttr) {
//      property.attrCount++;
//    }
//
//    
//    logger.trace("evaluating sequence element " + property.name);
//    logger.trace("   attrCount = " + property.attrCount);
//    
//    if (property.rangeList.length == 1 && !isAttr) {
//      logger.trace("getting globally defined element: " + property.uri);
//      
//      ref = universe.getXsdObject(property.uri);
//      logger.assert(ref, "Element not found: " + property.uri);
//      
//    }
//    if (!ref) {
//      logger.trace("Using type from property statement");
//      
//      type = universe.getXsdObject(statement.object.uri + ".Type"); 
//      if (!type) {
//        type = universe.getXsdObject(statement.object.uri); 
//      }
//      logger.assert(type, "Failed to find xsd type for " + statement.object.uri);
//    }
//    var max = statement.subject.getMaxCardinalityRestriction(property.uri);
//    var maxOccurs = max ? max.maxQualifiedCardinality : "unbounded";
//    
//    if (ref || (name && type)) {
//      
//      if (isAttr) {
//        var attr = new XsdAttribute(name, type, this.schema);
//        append(this.attributeList, attr);
//      } else {
//        new XsdSequenceElement(ref, name, type, maxOccurs, this);
//      }
//    } else {
//      logger.error("Sequence element is ill-defined for property " + property.name);
//    }
//  }
//  if (this.assignOrdinals()) {
//    this.sortSequence();
//  }
//  logger.debug("end buildSequence");
}

function XsdTypeSchema(rawPackage, universe) {
  logger.debug("new XsdTypeSchema " + rawPackage.Name);
  this.buildTypeList = XsdTypeSchema_buildTypeList;
  this.parseAttachments = Package_parseAttachments;
  this.parseAttachment = Package_parseAttachment;
  
  this.name = rawPackage.name;
  this.prefix = this.name;
  this.typeList = new Array();
  this.universe = universe;
  this.uml = rawPackage;
  
  this.parseAttachments();
  
  logger.assert(this.uri, "uri is not defined for package " + rawPackage.Pathname );
  
  if (this.uri) {
    universe.putUmlObject(this.uri, this);
    universe.putRdfObject(this.uri, this);
    universe.putXsdObject(this.uri, this);
    append(universe.simpleTypeSchemas, this);
    this.buildTypeList();
  }
  logger.debug("end XsdTypeSchema " + rawPackage.Name);
  
}

function XsdTypeSchema_buildTypeList() {
  logger.debug("begin XsdTypeSchema_buildTypeList " + this.name);
  var container = this.uml;
  for ( var i = 0; i < container.GetOwnedElementCount(); i++) {
    var elem = container.GetOwnedElementAt(i);
    
    if (elem.IsKindOf("UMLClass")) {
      var stereotype = elem.MOF_GetAttribute("StereotypeName");
      if ("simpleType" == stereotype) {
        new XsdSimpleType(elem, this);
        
      } else if ("datatype" == stereotype) {
        /* 
         * TODO: verify that the given UMLClass object represents
         * an XML Schema datatype.
         *  
         */
      } else {
        logger.warn("Ignoring class " + elem.Name + " because it is does not have the <<simpleType>> stereotype");
      }

    } 
  }
  logger.debug("end XsdTypeSchema_buildTypeList " + this.name);
  
}

function XsdFacet(name, value) {
  logger.debug("new XsdFacet " + name + " = " + value);
  this.name = name;
  this.value = value;
}

function XsdSimpleType(rawUml, schema) {
  logger.debug("new XsdSimpleType " + rawUml.Name);
  /* Use .Type suffix for simpletypes except for w3 standards */
  var suffix = (schema.uri.indexOf("http://www.w3.org/")==0) ? "" : ".Type";
  this.buildFacets = XsdSimpleType_buildFacets;
  this.rawUml = rawUml;
  this.name = rawUml.Name + suffix;
  this.documentation = rawUml.Documentation;
  this.facetList = new Array();
  this.schema = schema;
  this.ontology = schema;
  this.uri = schema.uri + this.name;
  
  append(schema.typeList, this);
  var universe = schema.universe;
  

  universe.pathMap[rawUml.Pathname] = this;
  
  universe.putUmlObject(this.uri, this);
  universe.putRdfObject(this.uri, this);
  universe.putXsdObject(this.uri, this);
  
  this.buildFacets();

  logger.debug("end XsdSimpleType " + rawUml.Name);
}

function XsdSimpleType_buildFacets() {
  
  logger.debug("XsdSimpleType_buildFacets " + this.name);

    var attrCount = this.rawUml.MOF_GetCollectionCount("Attributes");

    for (var i=0; i<attrCount; i++) {
      var field = this.rawUml.MOF_GetCollectionItem("Attributes", i);
      var name = field.Name;
      var value = field.TypeExpression;
      append(this.facetList, new XsdFacet(name, value));
    }
}

function XsdSchema(ontology) {
  logger.debug("new XsdSchema " + ontology.uri);
  this.buildComplexTypes = XsdSchema_buildComplexTypes;
  this.buildElements = XsdSchema_buildElements;
  this.buildResourceElements = XsdSchema_buildResourceElements;
  this.buildAttributeGroups = XsdSchema_buildAttributeGroups;
  this.addImportedSchema = XsdSchema_addImportedSchema;
  this.findImportedSchemas = XsdSchema_findImportedSchemas;
  this.universe = ontology.universe;
  this.ontology = ontology;
  this.uri = ontology.uri;
  this.prefix = ontology.prefix;
  this.complexTypeList = new Array();
  this.elementList = new Array();
  this.importedSchemaList = new Array();
  this.attributeGroupList = new Array();
  this.enumList = new Array();
  this.extensionAttrGroup = null;
  append(ontology.universe.xsdSchemaList, this);
  ontology.universe.putXsdObject(this.uri, this);
  

  this.buildAttributeGroups();
  this.buildComplexTypes(ontology);
  this.buildElements(ontology);
  this.buildResourceElements();
  
}

function XsdSchema_addImportedSchema(map, type) {
  var target = type.schema;
  if (target.uri == this.uri) return;
  map[target.uri] = target;
  logger.debug("imported schema: " + target.uri);
}

function XsdSchema_findImportedSchemas() {
  logger.debug("begin findImportedSchemas " + this.uri);
  var map = new Object();
  for (var i=0; i<this.elementList.length; i++) {
    var e = this.elementList[i];
    if (!e.type) {
      logger.trace("skipping element " + e.name + " because its type is not defined.");
      continue;
    }
    this.addImportedSchema(map, e.type);
  }
  for (var i=0; i<this.complexTypeList.length; i++) {
    var c = this.complexTypeList[i];
    if (!c.sequence) continue;
    for (var j=0; j<c.sequence.length; j++) {
      var e = c.sequence[j];
      if (e.type) this.addImportedSchema(map, e.type);
    } 
  }
  var list = new Array();
  for (var key in map) {
    append(list, map[key]);
  }
  this.importedSchemaList = list;
}

function XsdSchema_buildAttributeGroups() {
  /* 
   For now, we hard code the same attribute group into every schema.
   TODO: get the attributeGroups from the StarUML model.
   */
  var anyUri = this.universe.xsd.ANYURI;
  var group = this.extensionAttrGroup = new XsdAttributeGroup("extension.attr", this);
  
  append(group.attributeList, new XsdAnyAttribute("##other", "lax"));
}

function XsdSchema_buildResourceElements() {
  logger.debug("buildResourceElements " + this.name);
  var list = this.complexTypeList;
  for (var i=0; i<list.length; i++) {
    var type = list[i];
    if ("addressable" == type.stereotypeName) {
      
      var uri = type.rdfClass.uri;
      var name = type.rdfClass.name;
      var type = type; 
      var schema = this;
      
      new XsdElement(uri, name, type, schema, null);
    }
  }
  logger.debug("end buildResourceElements");
}

function XsdSchema_buildElements(ontology) {
  logger.debug("buildElements " + ontology.prefix);
  
  var list = ontology.propertyList;
  logger.trace("number of elements: " + list.length);
  for (var i=0; i<list.length; i++) {
    var rdfProperty = list[i];
    
    
    logger.trace(rdfProperty.name + " " + rdfProperty.attrCount + " " + rdfProperty.rangeList.length);
    if (rdfProperty.attrCount == rdfProperty.rangeList.length) {
      /*
        In the XSD binding, all of these properties are
        represented as attributes.  So there is no point in 
        creating an XML Element for this property.
       */
      continue;
    }
    
    /*
       We only define top-level elements in the schema for
       those properties that have a single type in the range.
       The others will require an inline element definition within
       the complex type.
    */
    if (rdfProperty.rangeList.length == 1) {
      
      var uri = rdfProperty.uri;
      var name = rdfProperty.name;
      var type = null; /* The type will be assigned later (see XsdBuilder_resolveElementTypes) */
      var schema = this;
      
      new XsdElement(uri, name, type, schema, rdfProperty);
      
    } else {
      logger.info("Not defining a top-level element for " + rdfProperty.uri + 
          " because the range contains multiple types.");
    }
  }
  
  
}
function XsdSchema_buildComplexTypes(ontology) {
  logger.debug("buildComplexTypes " + ontology.prefix);
  var list = ontology.classList;
  logger.trace("   classList size = " + list.length);
  for (var i=0; i<list.length; i++) {
    var rdfClass = list[i];
    var type = new XsdComplexType(rdfClass, this);
    /*
     * For now, hard code the references attribute group into every complex type.
     * (except for those that have supertypes)
     */
    if (!rdfClass.superTypes || rdfClass.superTypes.length == 0) {
      append(type.attributeGroupList, this.extensionAttrGroup);
    }
  }
}

function XsdWriter(universe) {
  logger.debug("new XsdWriter");
  this.printUniverse = XsdWriter_printUniverse;
  this.printSchema = XsdWriter_printSchema;
  this.printImportedSchemas = XsdWriter_printImportedSchemas;
  this.printComplexTypeList = XsdWriter_printComplexTypeList;
  this.printComplexType = XsdWriter_printComplexType;
  this.printElementList = XsdWriter_printElementList;
  this.printElement = XsdWriter_printElement; 
  this.printQName = XsdWriter_printQName;
  this.qname = XsdWriter_qname;
  this.printAttributeGroups = XsdWriter_printAttributeGroups;
  this.printAttributeGroup = XsdWriter_printAttributeGroup;
  this.printAttributeGroupRefs = XsdWriter_printAttributeGroupRefs;
  this.printEnum = XsdWriter_printEnum;
  this.printEnumList = XsdWriter_printEnumList;
  this.printTypeSchema = XsdWriter_printTypeSchema;
  this.printSimpleTypeList = XsdWriter_printSimpleTypeList;
  this.printSimpleType = XsdWriter_printSimpleType;
  this.printImportStatements = XsdWriter_printImportStatements;
  this.printAttributeList = XsdWriter_printAttributeList;
  this.printSequence = XsdWriter_printSequence;
  this.Writer = Writer;
  this.printXmlSchemaDeclarations = XsdWriter_printXmlSchemaDeclarations;
  this.Writer();
  this.universe = universe;
  this.xsdPrefix = universe.xsd.prefix + ':';
  this.schema = null;
}

function XsdWriter_printXmlSchemaDeclarations() {
  var list = this.universe.simpleTypeSchemas;
  this.println("@prefix owl: <http://www.w3.org/2002/07/owl#> .");
  this.println("@prefix bind: <http://purl.org/semantictools/v1/vocab/bind#> .");
  for (var i=0; i<list.length; i++) {
    var schema = list[i];
    this.println();
    this.println("<" + schema.uri + "> a owl:Ontology ;");
    this.pushIndent();
    this.indent().println("bind:suggestedPrefix \"" + schema.prefix + "\" .");
    this.popIndent();
  }
}

function XsdWriter_printAttributeList(type) {
  var list = type.attributeList;
  if (list.length == 0) return;
  var xs = this.xsdPrefix;
  for (var i=0; i<list.length; i++) {
    var a = list[i];
    var type = this.qname(a.type);
    
    this.indent().println('<' + xs + 'attribute name="' + a.name + '" type="' + type + '"/>' );
  }
}

function XsdWriter_printEnumList(schema) {
  logger.debug("XsdWriter printEnumList " + schema.prefix);
  var list = schema.enumList;
  for (var i=0; i<list.length; i++) {
    this.printEnum(list[i]);
  }

  logger.debug("end XsdWriter printEnumList " + schema.prefix);
}

function XsdWriter_printEnum(enumType) {
  logger.debug("XsdWriter printEnum " + enumType.name);
  var xs = this.xsdPrefix;
  var list = enumType.literalList;
  this.println();
  this.indent().println('<' + xs + 'simpleType name="' + enumType.name + '">');
  this.pushIndent();
    this.indent().println('<' + xs + 'restriction base="' + xs + 'string">');
    this.pushIndent();
    for (var i=0; i<list.length; i++) {
      var value = list[i].name;
      this.indent().println('<' + xs + 'enumeration value="' + value + '"/>');      
    }
    this.popIndent();
    this.indent().println('</' + xs + 'restriction>');
  this.popIndent();
  this.indent().println('</' + xs + 'simpleType>');
}

function XsdWriter_printAttributeGroupRefs(type) {
  logger.debug("printAttributeGroupRefs");
  if (type.valueType) return;
  var xs = this.xsdPrefix;
  var list = type.attributeGroupList;
  
  for (var i=0; i<list.length; i++) {
    var group = list[i];
    this.indent().println('<' + xs + 'attributeGroup ref="' + group.name + '"/>');
  }
  logger.debug("end printAttributeGroupRefs");
}

function XsdWriter_printAttributeGroup(group) {
  logger.debug("printAttributeGroup " + group.name);
  
  var xs = this.xsdPrefix;
  var list = group.attributeList;
  
  this.println();
  this.indent().println('<' + xs + 'attributeGroup name="' + group.name + '">');
  this.pushIndent();
    for (var i=0; i<list.length; i++) {
      var attr = list[i];
      
      if (attr.constructor == XsdAttribute) {
        var type = this.qname(attr.type);
        this.indent().println('<' + xs + 'attribute name="' + attr.name + '" type="' + type + '"/>');
      } else if (attr.constructor == XsdAnyAttribute) {
        this.indent().println('<' + xs + 'anyAttribute namespace="' + attr.namespace + '" processContents="' + attr.processContents + '"/>');
      }
    }
  
  this.popIndent();
  this.indent().println('</' + xs + 'attributeGroup>')
  
}

function XsdWriter_printAttributeGroups(schema) {
  logger.debug("printAttributeGroups " + schema.name);
  var list = schema.attributeGroupList;
  for (var i=0; i<list.length; i++) {
    this.printAttributeGroup(list[i]);
  }
}

function XsdWriter_qname(obj) {

  if (obj.schema.uri != this.schema.uri) {
    return obj.schema.prefix + ":" + obj.name;
  }
  return obj.name;
}
function XsdWriter_printQName(obj) {
  this.print(this.qname(obj));
  return this;
}

function XsdWriter_printElement(element) {
  logger.debug("begin XsdWriter printElement " + element.name);
  var type = element.type;
  
  if (!type) {
    logger.error("element type is missing: " + element.name);
  }
  
    
  this.indent().print("<" + this.xsdPrefix + "element ");
  this.print('name="').print(element.name).print('" type="').printQName(type);
  this.println('"/>');
  
  
  logger.debug("end XsdWriter printElement " + element.name);
  
}

function XsdWriter_printElementList(schema) {
  logger.debug("begin XsdWriter printElementList " + schema.prefix);
  var list = schema.elementList;
  for (var i=0; i<list.length; i++) {
    this.printElement(list[i]);
  }
  logger.debug("end XsdWriter printElementList " + schema.prefix);
  
}

/*
 
  <complexType name="ToolConsumerProfile">
    <sequence>
      <element name="capability" type="tns:Capability" maxOccurs="unbounded" minOccurs="1"></element>
    </sequence>
  </complexType>
 */
function XsdWriter_printComplexTypeList(schema) {
  logger.debug("XsdWriter printComplexTypeList " + schema.prefix);
  var list = schema.complexTypeList;
  for (var i=0; i<list.length; i++) {
    this.printComplexType(list[i]);
  }
  
}

function XsdWriter_printSequence(type) {
  var xs = this.xsdPrefix;
  var sequence = type.sequence;
  if (sequence.length == 0) return;
  
  this.indent().println("<" + xs + "sequence>");
  this.pushIndent();
    for (var i=0; i<sequence.length; i++) {
      var e = sequence[i];
      this.indent().print("<" + xs + "element ");
      if (e.ref) {
        this.print("ref=\"")
        this.printQName(e.ref);
        this.print("\"");
        
      } else if (e.name && e.type) {
        this.print("name=\"").print(e.name).print('" ');
        
        
        this.print('type="').printQName(e.type).print('"');
        
      } else {
        logger.error("Ill-defined sequence element in " + type.name);
      }

      this.print(' minOccurs="0"');
      
      if (e.maxOccurs) {
        this.print(' maxOccurs="').print(e.maxOccurs).print('"');
      } 
      this.println("/>");
    }
  this.popIndent();
  this.indent().println("</" + xs + "sequence>");
}

function XsdWriter_printComplexType(type) {
  logger.debug("XsdWriter printComplexType " + type.name);
  
  var xs = this.xsdPrefix;
  var base = type.extensionBase;
  var valueType = type.valueType;
  this.println();
  this.indent().print('<' + xs + 'complexType name="').print(type.name).println('">');
  this.pushIndent();

    if (base) {
      var baseName = this.qname(base);
      this.indent().println('<' + xs + 'complexContent>');
      this.pushIndent();
        this.indent().println('<' + xs + 'extension base="' + baseName + '">');
        this.pushIndent();
    }
    
    if (valueType) {

      var baseName = this.qname(valueType);
      this.indent().println('<' + xs + 'simpleContent>');
      this.pushIndent();
        this.indent().println('<' + xs + 'extension base="' + baseName + '">');
        this.pushIndent();
    }
    
    this.printSequence(type);
    this.printAttributeList(type);
    if (base) {
      this.popIndent();
      this.indent().println('</' + xs + 'extension>');
      this.popIndent();
      this.indent().println('</' + xs + 'complexContent>');
    }
    if (valueType) {
      this.popIndent();
      this.indent().println('</' + xs + 'extension>');
      this.popIndent();
      this.indent().println('</' + xs + 'simpleContent>');
    }
    this.printAttributeGroupRefs(type);
  this.popIndent();
  this.indent().println("</" + xs + "complexType>");
  logger.debug("end printComplexType");
}

function XsdWriter_printImportedSchemas(targetSchema) {
  logger.debug("XsdWriter printImportedSchemas " + targetSchema.prefix);
  var list = targetSchema.importedSchemaList;
  for (var i=0; i<list.length; i++) {
    var s = list[i];
    var uri = s.uri;
    if (uri == "http://www.w3.org/2001/XMLSchema#") {
      uri = "http://www.w3.org/2001/XMLSchema";
    }
    this.indent().println("xmlns:" + s.prefix + '="' + uri + '"');
    
  }
  logger.trace("end printImportedSchemas");

  
}

function XsdWriter_printImportStatements(schema) {

  logger.debug("XsdWriter printImportStatements " + schema.prefix);
  var xs = this.xsdPrefix;
  var list = schema.importedSchemaList;
  if (list.length > 0) {
    this.println();
  }
  for (var i=0; i<list.length; i++) {
    var s = list[i];
    if (s.uri == "http://www.w3.org/2001/XMLSchema#") {
      continue;
    }
    this.indent().println('<' + xs + 'import namespace="' + s.uri + '" schemaLocation="' + s.prefix + '.xsd"/>');
  }
  logger.trace("end printImportedStatements");
}


function XsdWriter_printUniverse() {
  logger.debug("XsdWriter printUniverse");
  for (var i=0; i<this.universe.xsdSchemaList.length; i++) {
    var schema = this.universe.xsdSchemaList[i];
    this.printSchema(schema);
  }
  var list = this.universe.simpleTypeSchemas;
  for (var i=0; i<list.length; i++) {
    this.printTypeSchema(list[i]);
  }
  
}

function XsdWriter_printSimpleType(type) {
  var xs = this.xsdPrefix;
  
  var id = type.name;
  var name = type.name;
  var base = xs + type.superTypes[0].name;
  var list = type.facetList;
  
  this.indent().println('<' + xs + 'simpleType id="' + id + '" name="' + name + '">');
  this.pushIndent();
    this.indent().println('<' + xs + 'restriction base="' + base + '">');
    this.pushIndent();
    for (var i=0; i<list.length; i++) {
      var facet = list[i].name;
      var value = list[i].value;
      this.indent().println('<' + xs + facet + ' value="' + value + '"/>' )
    }
    this.popIndent();
    this.indent().println('</' + xs + 'restriction>');
  this.popIndent();
  this.indent().println('</' + xs + 'simpleType>');
  
}

function XsdWriter_printSimpleTypeList(schema) {
  logger.debug("XsdWriter_printSimpleTypeList " + schema.prefix);
  var list = schema.typeList;
  for (var i=0; i<list.length; i++) {
    this.printSimpleType(list[i]);
  }
  logger.debug("end XsdWriter_printSimpleTypeList " + schema.prefix);
}

function XsdWriter_printTypeSchema(schema) {
  logger.debug("XsdWriter printTypeSchema " + schema.prefix);
  this.schema = schema;
  var xs = this.xsdPrefix;
  var xsd = this.schema.universe.xsd.prefix;
  
  var schemaUri = '"' + schema.uri + '"';
  
  this.println("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  this.println("<" + xs + "schema");
  this.pushIndent();
  
    this.indent().println("xmlns:" + xsd + '="http://www.w3.org/2001/XMLSchema"');
    this.indent().print("xmlns").print("=").println(schemaUri);
    this.indent().print("targetNamespace=").println(schemaUri);
    this.indent().println('elementFormDefault="qualified">');
    
    this.indent().println("<" + xs+"annotation>");
    this.pushIndent();
      this.indent().println("<" + xs + "appinfo>");
      this.pushIndent();
        this.indent().print("<label>").print(schema.name).println("</label>");
        this.indent().print("<prefix>").print(schema.prefix).println("</prefix>");
      this.popIndent();
      this.indent().println("</" + xs + "appinfo>");
    this.popIndent();
    this.indent().println("</" + xs + "annotation>");
    
    this.printSimpleTypeList(schema);
  
    this.popIndent();
  this.println("</" + xs + "schema>");
}


function XsdWriter_printSchema(schema) {
  logger.debug("XsdWriter printSchema " + schema.prefix);
  this.schema = schema;
  var xs = this.xsdPrefix;
  var xsd = this.schema.universe.xsd.prefix;
  
  var schemaUri = '"' + schema.uri + '"';
  
  this.println("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  this.println("<" + xs + "schema");
  this.pushIndent();
  
    this.indent().print("xmlns").print("=").println(schemaUri);
    this.indent().print("targetNamespace=").println(schemaUri);
    this.printImportedSchemas(schema);
    this.indent().println('elementFormDefault="qualified">');
    this.printImportStatements(schema);
    this.printAttributeGroups(schema);
    this.printEnumList(schema);
    this.printComplexTypeList(schema);
    this.printElementList(schema);
  
    this.popIndent();
  this.println("</" + xs + "schema>");

}

function ConfigurationWriter(universe) {
  logger.debug("new ConfigurationWriter");
  this.universe = universe;
  this.Writer = Writer;
  this.Writer();
  this.write = ConfigurationWriter_write;
  this.writeDataTypes = ConfigurationWriter_writeDataTypes;
  this.writeOntologies = ConfigurationWriter_writeOntologies;
}

function ConfigurationWriter_write() {
  logger.debug("ConfigurationWriter_write");
  this.println("<configuration>");
  this.pushIndent();
  this.writeDataTypes();
  this.writeOntologies();
  this.popIndent();
  this.println("</configuration>");
}
function ConfigurationWriter_writeOntologies() {
  logger.debug("ConfigurationWriter_writeOntologies");
  var list = this.universe.ontologyList;
  if (list.length == 0) return;
  this.indent().println("<ontologies>");
  for (var i=0; i<list.length; i++) {
    var onto = list[i];
    var prefix = onto.prefix;
    var uri = onto.uri;
    var file = "${basedir}/src/main/resources/rdf/" + prefix + ".ttl";
    this.indent().println("<ontology>");
    this.pushIndent();
    this.indent().println("<prefix>" + prefix + "</prefix>");
    this.indent().println("<uri>" + uri + "</uri>");
    this.indent().println("<file>" + file + "</file>");
    this.indent().println("<format>TURTLE</format>");
    this.popIndent();
    this.indent().println("</ontology>");
  }
  
  this.indent().println("</ontologies>");
  
}
function ConfigurationWriter_writeDataTypes() {
  logger.debug("ConfigurationWriter_writeDataTypes");
  var list = this.universe.simpleTypeSchemas;
  if (list.length == 0) return;
  this.indent().println("<datatypes>");
  this.pushIndent();
  for (var i=0; i<list.length; i++) {
    var xsd = list[i];
    var prefix = xsd.prefix;
    var uri = xsd.uri;
    var file = "${basedir}/src/main/resources/rdf/" + prefix + ".xsd";
    this.indent().println("<xmlschema>");
    this.pushIndent();
    this.indent().println("<prefix>" + prefix + "</prefix>");
    this.indent().println("<uri>" + uri + "</uri>");
    this.indent().println("<file>" + file + "</file>");
    this.popIndent();
    this.indent().println("</xmlschema>");
  }
  
  this.popIndent();
  this.indent().println("</datatypes>"); 
}


function getProjectAttachments(project) {
  var result = new Object();
  var attachments = project.Attachments;
  var lines = attachments.split('\r\n');
  for ( var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var colon = line.indexOf('=');
    if (colon > 0) {
      var key = line.substring(0, colon);
      var value = line.substring(colon+1);
      result[key] = value;
      logger.debug("Model attachment, " + key + " = " + value);
    }
  }
  return result;
}

function writeOntology() {

  var project = current();
  var attachments = getProjectAttachments(project);
  

  var universe = UNIVERSE;
  var builder = new ModelBuilder();
  builder.scanUniverse(project, universe);
  
  var ontoBuilder = new OntologyBuilder(universe);
  ontoBuilder.buildAll();
  
  var target = getTarget();
  
  OUTPUT = "";
  var writer = new OntologyWriter();
  for (var i=0; i<universe.ontologyList.length; i++) {
    var onto = universe.ontologyList[i];
    if (
      ("http://www.w3.org/2002/07/owl#" == onto.uri) || 
      ("http://www.w3.org/1999/02/22-rdf-syntax-ns#" == onto.uri) ||
      ("http://www.w3.org/2001/XMLSchema#" == onto.uri)
    ) {
      continue;
    }
    writer.text = "";
    writer.printOntology(onto);
    
    var fileName = target + "\\" + onto.prefix + ".ttl";
    fileBegin(fileName);

currentItem = currentItemStack.pop();
// END OF SCRIPT

// TEXT
print("");

// DISPLAY
currentItemStack.push(currentItem);
try {
    eval('currentItem = currentItem');
} catch (ex) {
    log('template.cot(4367):<@DISPLAY@> Error exists in path expression.');
    throw ex;
}
var value;
try {
    eval('value = writer.text');
} catch (ex) {
    log('template.cot(4367):<@DISPLAY@> Error exists in arguments.');
    throw ex;
}
try {
   print(value);
} catch (ex) {
    log('template.cot(4367):<@DISPLAY@> Error exists in command.');
    throw ex;
}
currentItem = currentItemStack.pop();
// END OF DISPLAY

// TEXT
print("\n");

// SCRIPT
currentItemStack.push(currentItem);

    fileEnd();
    OUTPUT += writer.text;
    writer.text = "";
        writer.printBinding(onto);
        
        fileName = target + "\\" + onto.prefix + "_binding.ttl";
        fileBegin(fileName);

currentItem = currentItemStack.pop();
// END OF SCRIPT

// TEXT
print("");

// DISPLAY
currentItemStack.push(currentItem);
try {
    eval('currentItem = currentItem');
} catch (ex) {
    log('template.cot(4377):<@DISPLAY@> Error exists in path expression.');
    throw ex;
}
var value;
try {
    eval('value = writer.text');
} catch (ex) {
    log('template.cot(4377):<@DISPLAY@> Error exists in arguments.');
    throw ex;
}
try {
   print(value);
} catch (ex) {
    log('template.cot(4377):<@DISPLAY@> Error exists in command.');
    throw ex;
}
currentItem = currentItemStack.pop();
// END OF DISPLAY

// TEXT
print("\n");

// SCRIPT
currentItemStack.push(currentItem);

    fileEnd();
    OUTPUT += writer.text;
  }

  builder = new XsdBuilder(universe);
  builder.buildAll();
  
  writer = new XsdWriter(universe);
    
  var list = universe.simpleTypeSchemas;
  for (var i=0; i<list.length; i++) {
    
    logger.debug("preparing to print XSD ... " + list[i].uri);
  
    if (list[i].uri.indexOf("http://www.w3.org/")==0) continue;
    
    writer.text = "";
    writer.printTypeSchema(list[i]);
    
    fileName = target + "\\" + list[i].prefix + ".xsd";
    
    fileBegin(fileName);

currentItem = currentItemStack.pop();
// END OF SCRIPT

// TEXT
print("");

// DISPLAY
currentItemStack.push(currentItem);
try {
    eval('currentItem = currentItem');
} catch (ex) {
    log('template.cot(4402):<@DISPLAY@> Error exists in path expression.');
    throw ex;
}
var value;
try {
    eval('value = writer.text');
} catch (ex) {
    log('template.cot(4402):<@DISPLAY@> Error exists in arguments.');
    throw ex;
}
try {
   print(value);
} catch (ex) {
    log('template.cot(4402):<@DISPLAY@> Error exists in command.');
    throw ex;
}
currentItem = currentItemStack.pop();
// END OF DISPLAY

// TEXT
print("\n");

// SCRIPT
currentItemStack.push(currentItem);

    fileEnd();
  }
  writer.text = "";
  writer.printXmlSchemaDeclarations();
  fileBegin(target + "\\xmlDatatypes.ttl");

currentItem = currentItemStack.pop();
// END OF SCRIPT

// TEXT
print("");

// DISPLAY
currentItemStack.push(currentItem);
try {
    eval('currentItem = currentItem');
} catch (ex) {
    log('template.cot(4410):<@DISPLAY@> Error exists in path expression.');
    throw ex;
}
var value;
try {
    eval('value = writer.text');
} catch (ex) {
    log('template.cot(4410):<@DISPLAY@> Error exists in arguments.');
    throw ex;
}
try {
   print(value);
} catch (ex) {
    log('template.cot(4410):<@DISPLAY@> Error exists in command.');
    throw ex;
}
currentItem = currentItemStack.pop();
// END OF DISPLAY

// TEXT
print("\n");

// SCRIPT
currentItemStack.push(currentItem);

  fileEnd();
  
  OUTPUT = OUTPUT + writer.text;
  
  writer = new ConfigurationWriter(universe);
  writer.write();
  fileName = target + "\\configuration.xml";
  fileBegin(fileName);

currentItem = currentItemStack.pop();
// END OF SCRIPT

// TEXT
print("");

// DISPLAY
currentItemStack.push(currentItem);
try {
    eval('currentItem = currentItem');
} catch (ex) {
    log('template.cot(4421):<@DISPLAY@> Error exists in path expression.');
    throw ex;
}
var value;
try {
    eval('value = writer.text');
} catch (ex) {
    log('template.cot(4421):<@DISPLAY@> Error exists in arguments.');
    throw ex;
}
try {
   print(value);
} catch (ex) {
    log('template.cot(4421):<@DISPLAY@> Error exists in command.');
    throw ex;
}
currentItem = currentItemStack.pop();
// END OF DISPLAY

// TEXT
print("\n");

// SCRIPT
currentItemStack.push(currentItem);

      fileEnd();
  
}
writeOntology();
log("end script");

currentItem = currentItemStack.pop();
// END OF SCRIPT

// TEXT
print("\n");

// REPEAT
currentItemStack.push(currentItem);

try {
    eval('var rootElem = currentItem');
}catch (ex) {
    log('template.cot(4430):<@REPEAT@> Error exists in  path expression.');
    throw ex
}
try {
    eval('var elemArr1 = getAllElements(false, rootElem, \'UMLModel\', \'\', \'\')');
}catch (ex) {
    log('template.cot(4430):<@REPEAT@> Error exists in path, type, collection name.');
    throw ex
}
try {
    for (var i1 = 0, c1 = elemArr1.length; i1 < c1; i1++ ) {
        currentItem = elemArr1[i1];
        
        // TEXT
        print("");
        
        // DISPLAY
        currentItemStack.push(currentItem);
        try {
            eval('currentItem = currentItem');
        } catch (ex) {
            log('template.cot(4431):<@DISPLAY@> Error exists in path expression.');
            throw ex;
        }
        var value;
        try {
            eval('value = OUTPUT');
        } catch (ex) {
            log('template.cot(4431):<@DISPLAY@> Error exists in arguments.');
            throw ex;
        }
        try {
           print(value);
        } catch (ex) {
            log('template.cot(4431):<@DISPLAY@> Error exists in command.');
            throw ex;
        }
        currentItem = currentItemStack.pop();
        // END OF DISPLAY
        
        // TEXT
        print("\n");

    }
} catch (ex) {
    log('template.cot(4430):<@REPEAT@> Error exists in command.');
    throw ex;
}
currentItem = currentItemStack.pop();
// END OF REPEAT

// TEXT
print("\n");

// TEXT
print("");

// TEXT
print("");

// TEXT
print("");

// TEXT
print("");

// TEXT
print("");

// TEXT
print("");
