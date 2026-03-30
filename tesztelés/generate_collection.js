const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const outputPath = path.join(__dirname, "zaszlo_backend.postman_collection.json");
const defaultUploadPath = path.join(__dirname, "test-upload.txt");

const collectionVariables = [
  ["baseUrl", "http://localhost:8080"],
  ["adminEmail", "admin@example.com"],
  ["adminPassword", "Admin123!"],
  ["userPassword", "Test1234!"],
  ["allowDangerousAdminChanges", "false"],
  ["uploadFilePath", defaultUploadPath],
  ["itemQuantity", "2"],
  ["itemUnitPrice", "1234"],
  ["runId", ""],
  ["userEmail", ""],
  ["deleteUserEmail", ""],
  ["userToken", ""],
  ["adminToken", ""],
  ["userId", ""],
  ["deleteUserId", ""],
  ["paymentMethodId", ""],
  ["targetContinentId", ""],
  ["targetSizeId", ""],
  ["targetSizeName", ""],
  ["targetMaterialId", ""],
  ["targetMaterialName", ""],
  ["createdFlagId", ""],
  ["createdCountryId", ""],
  ["createdBulkCountryId", ""],
  ["createdInvoiceId", ""],
  ["createdPaymentMethodId", ""],
  ["createdSizeId", ""],
  ["createdMaterialId", ""],
  ["newCountryName", ""],
  ["updatedCountryName", ""],
  ["bulkCountryName", ""],
  ["newPaymentMethodName", ""],
  ["newSizeName", ""],
  ["updatedSizeName", ""],
  ["newMaterialName", ""],
  ["updatedMaterialName", ""],
];

const vars = collectionVariables.map(([key, value]) => ({ key, value }));

const collectionPrerequest = [
  "const vars = pm.collectionVariables;",
  "const resetKeys = [",
  '  "runId",',
  '  "userEmail",',
  '  "deleteUserEmail",',
  '  "userToken",',
  '  "adminToken",',
  '  "userId",',
  '  "deleteUserId",',
  '  "paymentMethodId",',
  '  "targetContinentId",',
  '  "targetSizeId",',
  '  "targetSizeName",',
  '  "targetMaterialId",',
  '  "targetMaterialName",',
  '  "createdFlagId",',
  '  "createdCountryId",',
  '  "createdBulkCountryId",',
  '  "createdInvoiceId",',
  '  "createdPaymentMethodId",',
  '  "createdSizeId",',
  '  "createdMaterialId",',
  '  "newCountryName",',
  '  "updatedCountryName",',
  '  "bulkCountryName",',
  '  "newPaymentMethodName",',
  '  "newSizeName",',
  '  "updatedSizeName",',
  '  "newMaterialName",',
  '  "updatedMaterialName"',
  "];",
  'if (pm.info.requestName === "GET /") {',
  "  resetKeys.forEach((key) => vars.unset(key));",
  '  vars.set("runId", String(Date.now()));',
  "}",
  'const runId = vars.get("runId") || String(Date.now());',
  'vars.set("runId", runId);',
  "const ensure = (key, value) => {",
  "  if (!vars.get(key)) {",
  "    vars.set(key, value);",
  "  }",
  "};",
  'ensure("baseUrl", "http://localhost:8080");',
  'ensure("adminEmail", "admin@example.com");',
  'ensure("adminPassword", "Admin123!");',
  'ensure("userPassword", "Test1234!");',
  `ensure("uploadFilePath", ${JSON.stringify(defaultUploadPath)});`,
  'ensure("itemQuantity", "2");',
  'ensure("itemUnitPrice", "1234");',
  'ensure("allowDangerousAdminChanges", "false");',
  'ensure("userEmail", `postman.user.${runId}@example.com`);',
  'ensure("deleteUserEmail", `postman.delete.${runId}@example.com`);',
  'ensure("newCountryName", `PostmanCountry${runId}`);',
  'ensure("updatedCountryName", `PostmanCountryUpdated${runId}`);',
  'ensure("bulkCountryName", `PostmanBulk${runId}`);',
  'ensure("newPaymentMethodName", `PostmanFizetes${runId}`);',
  'ensure("newSizeName", `PostmanMeret${runId}`);',
  'ensure("updatedSizeName", `PostmanMeretUpdated${runId}`);',
  'ensure("newMaterialName", `PostmanAnyag${runId}`);',
  'ensure("updatedMaterialName", `PostmanAnyagUpdated${runId}`);',
];

const dangerousGuard = [
  'if (pm.collectionVariables.get("allowDangerousAdminChanges") !== "true") {',
  '  throw new Error("Ez a request globalis meret vagy anyag adatokat modosit. Csak teszt adatbazison futtasd, es allitsd az allowDangerousAdminChanges valtozot true-ra.");',
  "}",
];

function event(listen, exec) {
  return {
    listen,
    script: {
      type: "text/javascript",
      exec,
    },
  };
}

function request({
  name,
  method,
  url,
  authVar,
  body,
  formdata,
  tests = [],
  prerequest = [],
  description,
}) {
  const req = {
    method,
    header: [],
    url,
  };

  if (description) {
    req.description = description;
  }

  if (authVar) {
    req.auth = {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: `{{${authVar}}}`,
          type: "string",
        },
      ],
    };
  }

  if (body) {
    req.header.push({
      key: "Content-Type",
      value: "application/json",
      type: "text",
    });
    req.body = {
      mode: "raw",
      raw: body,
      options: {
        raw: {
          language: "json",
        },
      },
    };
  }

  if (formdata) {
    req.body = {
      mode: "formdata",
      formdata,
    };
  }

  const item = {
    name,
    request: req,
  };

  const events = [];
  if (prerequest.length) {
    events.push(event("prerequest", prerequest));
  }
  if (tests.length) {
    events.push(event("test", tests));
  }
  if (events.length) {
    item.event = events;
  }

  return item;
}

function folder(name, description, items) {
  return {
    name,
    description,
    item: items,
  };
}

const collection = {
  info: {
    _postman_id: randomUUID(),
    name: "Zaszlo Backend API",
    description:
      "A teljes backendhez keszitett Postman collection. A collection elejerol futtasd, mert a loginok, tokenek es teszt adatok egymasra epulnek. Az allowDangerousAdminChanges alapbol false, mert a meret es anyag admin endpointok globalis adatokat modositanak.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  event: [event("prerequest", collectionPrerequest)],
  variable: vars,
  item: [
    folder("00 Public", "Publikus, olvaso vegpontok es alap valtozok beallitasa.", [
      request({
        name: "GET /",
        method: "GET",
        url: "{{baseUrl}}/",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.test("HTML valasz erkezett", function () {',
          '  pm.expect(pm.response.headers.get("Content-Type") || "").to.include("text/html");',
          "});",
        ],
      }),
      request({
        name: "GET /zaszlok",
        method: "GET",
        url: "{{baseUrl}}/zaszlok",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Tomb erkezett", function () {',
          '  pm.expect(data).to.be.an("array");',
          "});",
        ],
      }),
      request({
        name: "GET /zaszlok/popular?limit=5",
        method: "GET",
        url: "{{baseUrl}}/zaszlok/popular?limit=5",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Tomb erkezett", function () {',
          '  pm.expect(data).to.be.an("array");',
          "});",
        ],
      }),
      request({
        name: "GET /szamlak/payment-methods",
        method: "GET",
        url: "{{baseUrl}}/szamlak/payment-methods",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Tomb erkezett", function () {',
          '  pm.expect(data).to.be.an("array");',
          "});",
          'pm.test("Van legalabb egy fizetesi mod", function () {',
          "  pm.expect(data.length).to.be.greaterThan(0);",
          "});",
          "if (data[0] && data[0].id) {",
          '  pm.collectionVariables.set("paymentMethodId", String(data[0].id));',
          "}",
        ],
      }),
    ]),
    folder("01 User Auth And Profile", "Tesztfelhasznalok letrehozasa, bejelentkezes es profil vegpontok.", [
      request({
        name: "POST /auth/register (main user)",
        method: "POST",
        url: "{{baseUrl}}/auth/register",
        body: `{
  "nev": "Postman User {{runId}}",
  "email": "{{userEmail}}",
  "jelszo": "{{userPassword}}",
  "telefonszam": "+3612345678",
  "iranyitoszam": "1111",
  "varos": "Budapest",
  "utca": "Teszt utca 1",
  "adoszam": "12345678-1-42"
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
        ],
      }),
      request({
        name: "POST /auth/register (delete candidate)",
        method: "POST",
        url: "{{baseUrl}}/auth/register",
        body: `{
  "nev": "Postman Delete Candidate {{runId}}",
  "email": "{{deleteUserEmail}}",
  "jelszo": "{{userPassword}}",
  "telefonszam": "+3611111111",
  "iranyitoszam": "2222",
  "varos": "Szeged",
  "utca": "Masik utca 2",
  "adoszam": "87654321-1-42"
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
        ],
      }),
      request({
        name: "POST /auth/login (main user)",
        method: "POST",
        url: "{{baseUrl}}/auth/login",
        body: `{
  "email": "{{userEmail}}",
  "jelszo": "{{userPassword}}"
}`,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Access token erkezett", function () {',
          '  pm.expect(data.accessToken).to.be.a("string").and.not.empty;',
          "});",
          'pm.collectionVariables.set("userToken", data.accessToken);',
        ],
      }),
      request({
        name: "POST /auth/refresh-token",
        method: "POST",
        url: "{{baseUrl}}/auth/refresh-token",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Uj access token erkezett", function () {',
          '  pm.expect(data.accessToken).to.be.a("string").and.not.empty;',
          "});",
          'pm.collectionVariables.set("userToken", data.accessToken);',
        ],
      }),
      request({
        name: "GET /auth/profil",
        method: "GET",
        url: "{{baseUrl}}/auth/profil",
        authVar: "userToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Felhasznalo objektum erkezett", function () {',
          '  pm.expect(data.user).to.be.an("object");',
          "});",
          "if (data.user && data.user.id) {",
          '  pm.collectionVariables.set("userId", String(data.user.id));',
          "}",
        ],
      }),
      request({
        name: "PUT /auth/profil/update",
        method: "PUT",
        url: "{{baseUrl}}/auth/profil/update",
        authVar: "userToken",
        body: `{
  "nev": "Postman Updated {{runId}}",
  "telefonszam": "+36201234567",
  "iranyitoszam": "1133",
  "varos": "Budapest",
  "utca": "Frissitett utca 3",
  "adoszam": "12345678-1-99"
}`,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("A profil frissult", function () {',
          '  pm.expect(data.user && data.user.nev).to.eql("Postman Updated " + pm.collectionVariables.get("runId"));',
          "});",
        ],
      }),
    ]),
    folder("02 Admin Auth And Users", "Admin login es user-admin vegpontok.", [
      request({
        name: "POST /auth/login (admin)",
        method: "POST",
        url: "{{baseUrl}}/auth/login",
        description: "Toltsd ki az adminEmail es adminPassword valtozokat valos admin fiokkal.",
        body: `{
  "email": "{{adminEmail}}",
  "jelszo": "{{adminPassword}}"
}`,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Admin access token erkezett", function () {',
          '  pm.expect(data.accessToken).to.be.a("string").and.not.empty;',
          "});",
          'pm.collectionVariables.set("adminToken", data.accessToken);',
        ],
      }),
      request({
        name: "GET /auth/admin/users?limit=100&page=1",
        method: "GET",
        url: "{{baseUrl}}/auth/admin/users?limit=100&page=1",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Users tomb erkezett", function () {',
          '  pm.expect(data.users).to.be.an("array");',
          "});",
          'const mainUser = data.users.find((item) => item.email === pm.collectionVariables.get("userEmail"));',
          'const deleteUser = data.users.find((item) => item.email === pm.collectionVariables.get("deleteUserEmail"));',
          "if (mainUser && mainUser.id) {",
          '  pm.collectionVariables.set("userId", String(mainUser.id));',
          "}",
          "if (deleteUser && deleteUser.id) {",
          '  pm.collectionVariables.set("deleteUserId", String(deleteUser.id));',
          "}",
          'pm.test("A letrehozott felhasznalok lathatoak", function () {',
          "  pm.expect(Boolean(mainUser)).to.eql(true);",
          "  pm.expect(Boolean(deleteUser)).to.eql(true);",
          "});",
        ],
      }),
      request({
        name: "PUT /auth/admin/users/:id/role",
        method: "PUT",
        url: "{{baseUrl}}/auth/admin/users/{{deleteUserId}}/role",
        authVar: "adminToken",
        body: `{
  "jogosultsag": "user"
}`,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("A valasz user jogosultsagot tartalmaz", function () {',
          '  pm.expect(data.user && data.user.jogosultsag).to.eql("user");',
          "});",
        ],
      }),
    ]),
    folder("03 Admin Flags Setup", "Admin zaszlo vegpontok a sajat tesztadatokra. Ezek a requestek csak a collection altal letrehozott orszagokat erintik.", [
      request({
        name: "GET /zaszlok/admin/meta",
        method: "GET",
        url: "{{baseUrl}}/zaszlok/admin/meta",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Meta adatok erkeztek", function () {',
          '  pm.expect(data.meretek).to.be.an("array").and.not.empty;',
          '  pm.expect(data.anyagok).to.be.an("array").and.not.empty;',
          '  pm.expect(data.kontinensek).to.be.an("array").and.not.empty;',
          "});",
          "if (data.kontinensek[0]) {",
          '  pm.collectionVariables.set("targetContinentId", String(data.kontinensek[0].id));',
          "}",
          "if (data.meretek[0]) {",
          '  pm.collectionVariables.set("targetSizeId", String(data.meretek[0].id));',
          '  pm.collectionVariables.set("targetSizeName", String(data.meretek[0].meret));',
          "}",
          "if (data.anyagok[0]) {",
          '  pm.collectionVariables.set("targetMaterialId", String(data.anyagok[0].id));',
          '  pm.collectionVariables.set("targetMaterialName", String(data.anyagok[0].anyag));',
          "}",
        ],
      }),
      request({
        name: "GET /zaszlok/admin-list",
        method: "GET",
        url: "{{baseUrl}}/zaszlok/admin-list",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Tomb erkezett", function () {',
          '  pm.expect(data).to.be.an("array");',
          "});",
        ],
      }),
      request({
        name: "POST /zaszlok",
        method: "POST",
        url: "{{baseUrl}}/zaszlok",
        authVar: "adminToken",
        body: `{
  "orszag": "{{newCountryName}}",
  "meretId": {{targetSizeId}},
  "anyagId": {{targetMaterialId}},
  "kontinensId": {{targetContinentId}}
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
          "const data = pm.response.json();",
          "if (data.id) {",
          '  pm.collectionVariables.set("createdFlagId", String(data.id));',
          "}",
          "if (data.orszagId) {",
          '  pm.collectionVariables.set("createdCountryId", String(data.orszagId));',
          "}",
          'pm.test("Flag es orszag id mentve", function () {',
          '  pm.expect(pm.collectionVariables.get("createdFlagId")).to.be.a("string").and.not.empty;',
          '  pm.expect(pm.collectionVariables.get("createdCountryId")).to.be.a("string").and.not.empty;',
          "});",
        ],
      }),
      request({
        name: "POST /zaszlok/upload/:orszagId",
        method: "POST",
        url: "{{baseUrl}}/zaszlok/upload/{{createdCountryId}}",
        authVar: "adminToken",
        description: "Az uploadFilePath alapbol a postman/test-upload.txt fajlra mutat. Ha mashol importalod a collectiont, frissitsd ezt a valtozot.",
        formdata: [
          {
            key: "image",
            type: "file",
            src: "{{uploadFilePath}}",
          },
        ],
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Filename erkezett", function () {',
          '  pm.expect(data.filename).to.be.a("string").and.not.empty;',
          "});",
        ],
      }),
      request({
        name: "GET /zaszlok/:id",
        method: "GET",
        url: "{{baseUrl}}/zaszlok/{{createdFlagId}}",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("A letrehozott zaszlo jott vissza", function () {',
          '  pm.expect(String(data.id)).to.eql(pm.collectionVariables.get("createdFlagId"));',
          "});",
          "if (data.meret) {",
          '  pm.collectionVariables.set("targetSizeName", String(data.meret));',
          "}",
          "if (data.anyag) {",
          '  pm.collectionVariables.set("targetMaterialName", String(data.anyag));',
          "}",
        ],
      }),
      request({
        name: "PUT /zaszlok/admin/countries/:id",
        method: "PUT",
        url: "{{baseUrl}}/zaszlok/admin/countries/{{createdCountryId}}",
        authVar: "adminToken",
        body: `{
  "orszag": "{{updatedCountryName}}",
  "kontinensId": {{targetContinentId}}
}`,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Az orszag neve frissult", function () {',
          '  pm.expect(data.country && data.country.orszag).to.eql(pm.collectionVariables.get("updatedCountryName"));',
          "});",
        ],
      }),
      request({
        name: "GET /zaszlok/search?orszag={{updatedCountryName}}",
        method: "GET",
        url: "{{baseUrl}}/zaszlok/search?orszag={{updatedCountryName}}",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("A modositott orszag keresheto", function () {',
          '  pm.expect(data).to.be.an("array").and.not.empty;',
          "});",
        ],
      }),
      request({
        name: "POST /zaszlok/admin/bulk-create",
        method: "POST",
        url: "{{baseUrl}}/zaszlok/admin/bulk-create",
        authVar: "adminToken",
        body: `{
  "orszag": "{{bulkCountryName}}",
  "kontinensId": {{targetContinentId}},
  "meretIds": [{{targetSizeId}}],
  "anyagIds": [{{targetMaterialId}}]
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
          "const data = pm.response.json();",
          "if (data.orszagId) {",
          '  pm.collectionVariables.set("createdBulkCountryId", String(data.orszagId));',
          "}",
          'pm.test("Letrejott legalabb egy variacio", function () {',
          "  pm.expect(Number(data.createdCount || 0)).to.be.greaterThan(0);",
          "});",
        ],
      }),
    ]),
    folder("04 User Invoices", "Felhasznaloi szamla vegpontok a collection altal letrehozott zaszloval.", [
      request({
        name: "POST /szamlak",
        method: "POST",
        url: "{{baseUrl}}/szamlak",
        authVar: "userToken",
        body: `{
  "fizetesiModId": {{paymentMethodId}},
  "kosar": [
    {
      "variantId": {{createdFlagId}},
      "orszagId": {{createdCountryId}},
      "meret": "{{targetSizeName}}",
      "anyag": "{{targetMaterialName}}",
      "db": {{itemQuantity}},
      "ar": {{itemUnitPrice}}
    }
  ]
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
          "const data = pm.response.json();",
          "if (data.szamlaId) {",
          '  pm.collectionVariables.set("createdInvoiceId", String(data.szamlaId));',
          "}",
          'pm.test("A szamla sikeresen letrejott", function () {',
          "  pm.expect(data.success).to.eql(true);",
          '  pm.expect(pm.collectionVariables.get("createdInvoiceId")).to.be.a("string").and.not.empty;',
          "});",
        ],
      }),
      request({
        name: "GET /szamlak",
        method: "GET",
        url: "{{baseUrl}}/szamlak",
        authVar: "userToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Tomb erkezett", function () {',
          '  pm.expect(data).to.be.an("array");',
          "});",
          "const invoiceId = Number(pm.collectionVariables.get('createdInvoiceId'));",
          "const found = data.find((item) => Number(item.id) === invoiceId);",
          'pm.test("A letrehozott szamla latszik a sajat listaban", function () {',
          "  pm.expect(Boolean(found)).to.eql(true);",
          "});",
        ],
      }),
    ]),
    folder("05 Admin Invoices And Payment Methods", "Admin szamla es fizetesi mod vegpontok. A fizetesi mod teszt sajat, kulon letrehozott eroforrassal dolgozik.", [
      request({
        name: "POST /szamlak/admin/payment-methods",
        method: "POST",
        url: "{{baseUrl}}/szamlak/admin/payment-methods",
        authVar: "adminToken",
        body: `{
  "nev": "{{newPaymentMethodName}}"
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
          "const data = pm.response.json();",
          "if (data.fizetesiMod && data.fizetesiMod.id) {",
          '  pm.collectionVariables.set("createdPaymentMethodId", String(data.fizetesiMod.id));',
          "}",
          'pm.test("A fizetesi mod letrejott", function () {',
          '  pm.expect(pm.collectionVariables.get("createdPaymentMethodId")).to.be.a("string").and.not.empty;',
          "});",
        ],
      }),
      request({
        name: "DELETE /szamlak/admin/payment-methods/:id",
        method: "DELETE",
        url: "{{baseUrl}}/szamlak/admin/payment-methods/{{createdPaymentMethodId}}",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("createdPaymentMethodId");',
        ],
      }),
      request({
        name: "GET /szamlak/admin",
        method: "GET",
        url: "{{baseUrl}}/szamlak/admin",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          "const data = pm.response.json();",
          'pm.test("Tomb erkezett", function () {',
          '  pm.expect(data).to.be.an("array");',
          "});",
          "const invoiceId = Number(pm.collectionVariables.get('createdInvoiceId'));",
          "const found = data.find((item) => Number(item.id) === invoiceId);",
          'pm.test("A letrehozott szamlat admin is latja", function () {',
          "  pm.expect(Boolean(found)).to.eql(true);",
          "});",
        ],
      }),
      request({
        name: "DELETE /szamlak/admin/:id",
        method: "DELETE",
        url: "{{baseUrl}}/szamlak/admin/{{createdInvoiceId}}",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("createdInvoiceId");',
        ],
      }),
    ]),
    folder("06 Cleanup", "A collection altal letrehozott teszt orszagok, zaszlok es felhasznalok takaritasa.", [
      request({
        name: "DELETE /zaszlok/:id",
        method: "DELETE",
        url: "{{baseUrl}}/zaszlok/{{createdFlagId}}",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("createdFlagId");',
          'pm.collectionVariables.unset("createdCountryId");',
        ],
      }),
      request({
        name: "DELETE /zaszlok/admin/countries/:id",
        method: "DELETE",
        url: "{{baseUrl}}/zaszlok/admin/countries/{{createdBulkCountryId}}",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("createdBulkCountryId");',
        ],
      }),
      request({
        name: "DELETE /auth/admin/users/:id",
        method: "DELETE",
        url: "{{baseUrl}}/auth/admin/users/{{deleteUserId}}",
        authVar: "adminToken",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("deleteUserId");',
        ],
      }),
      request({
        name: "POST /auth/logout",
        method: "POST",
        url: "{{baseUrl}}/auth/logout",
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("userToken");',
          'pm.collectionVariables.unset("adminToken");',
        ],
      }),
    ]),
    folder("07 Optional Dangerous Size And Material Admin", "Olyan vegpontok, amelyek globalis meret vagy anyag adatokat modositanak. Ezekhez allitsd az allowDangerousAdminChanges valtozot true-ra, es csak teszt adatbazison futtasd.", [
      request({
        name: "POST /zaszlok/admin/sizes",
        method: "POST",
        url: "{{baseUrl}}/zaszlok/admin/sizes",
        authVar: "adminToken",
        prerequest: dangerousGuard,
        body: `{
  "meret": "{{newSizeName}}",
  "szorzo": 1.15
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
          "const data = pm.response.json();",
          "if (data.meret && data.meret.id) {",
          '  pm.collectionVariables.set("createdSizeId", String(data.meret.id));',
          "}",
        ],
      }),
      request({
        name: "PUT /zaszlok/admin/sizes/:id",
        method: "PUT",
        url: "{{baseUrl}}/zaszlok/admin/sizes/{{createdSizeId}}",
        authVar: "adminToken",
        prerequest: dangerousGuard,
        body: `{
  "meret": "{{updatedSizeName}}",
  "szorzo": 1.25
}`,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
        ],
      }),
      request({
        name: "DELETE /zaszlok/admin/sizes/:id",
        method: "DELETE",
        url: "{{baseUrl}}/zaszlok/admin/sizes/{{createdSizeId}}",
        authVar: "adminToken",
        prerequest: dangerousGuard,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("createdSizeId");',
        ],
      }),
      request({
        name: "POST /zaszlok/admin/materials",
        method: "POST",
        url: "{{baseUrl}}/zaszlok/admin/materials",
        authVar: "adminToken",
        prerequest: dangerousGuard,
        body: `{
  "anyag": "{{newMaterialName}}",
  "szorzo": 1.1
}`,
        tests: [
          'pm.test("Status 201", function () {',
          "  pm.response.to.have.status(201);",
          "});",
          "const data = pm.response.json();",
          "if (data.anyag && data.anyag.id) {",
          '  pm.collectionVariables.set("createdMaterialId", String(data.anyag.id));',
          "}",
        ],
      }),
      request({
        name: "PUT /zaszlok/admin/materials/:id",
        method: "PUT",
        url: "{{baseUrl}}/zaszlok/admin/materials/{{createdMaterialId}}",
        authVar: "adminToken",
        prerequest: dangerousGuard,
        body: `{
  "anyag": "{{updatedMaterialName}}",
  "szorzo": 1.3
}`,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
        ],
      }),
      request({
        name: "DELETE /zaszlok/admin/materials/:id",
        method: "DELETE",
        url: "{{baseUrl}}/zaszlok/admin/materials/{{createdMaterialId}}",
        authVar: "adminToken",
        prerequest: dangerousGuard,
        tests: [
          'pm.test("Status 200", function () {',
          "  pm.response.to.have.status(200);",
          "});",
          'pm.collectionVariables.unset("createdMaterialId");',
        ],
      }),
    ]),
  ],
};

fs.writeFileSync(outputPath, `${JSON.stringify(collection, null, 2)}\n`, "utf8");
console.log(outputPath);
