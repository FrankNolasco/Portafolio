"""Contrato estático de la demostración de contacto, sin ejecutar scripts."""
from html.parser import HTMLParser
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.nodes = []
        self.stack = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "text": "",
                "parents": self.stack.copy()}
        self.nodes.append(node)
        if tag not in {"input", "link", "meta", "img", "br", "hr"}:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack and self.stack[-1]["tag"] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1]["tag"] == tag:
            self.stack.pop()

    def handle_data(self, data):
        for node in self.stack:
            node["text"] += data


class ContactoTest(unittest.TestCase):
    def setUp(self):
        self.doc = Document((ROOT / "index.html").read_text(encoding="utf-8"))
        sections = [n for n in self.doc.nodes if
                    "contacto" in n["attrs"].get("class", "").split()]
        self.assertEqual(len(sections), 1)
        self.section = sections[0]
        self.nodes = [n for n in self.doc.nodes
                      if any(p is self.section for p in n["parents"])]

    def test_labels_and_types(self):
        expected = [("Nombre", "input", "text"),
                    ("Correo electrónico", "input", "email"),
                    ("Mensaje", "textarea", None)]
        controls = [n for n in self.nodes if n["tag"] in {"input", "textarea"}]
        self.assertEqual(len(controls), 3)
        for text, tag, kind in expected:
            labels = [n for n in self.nodes if n["tag"] == "label"
                      and n["text"].strip() == text]
            self.assertEqual(len(labels), 1)
            target = labels[0]["attrs"]["for"]
            matches = [n for n in self.doc.nodes if n["attrs"].get("id") == target]
            self.assertEqual(len(matches), 1)
            self.assertEqual(matches[0]["tag"], tag)
            self.assertEqual(matches[0]["attrs"].get("type"), kind)
            self.assertNotIn("hidden", labels[0]["attrs"])

    def test_demo_has_no_submission(self):
        self.assertEqual(self.section["tag"], "section")
        self.assertTrue(any(n["text"].strip() == "Contacto" for n in self.nodes))
        self.assertTrue(any(n["text"].strip() == "Demostración: no se envían datos"
                            for n in self.nodes))
        buttons = [n for n in self.nodes if n["tag"] == "button"]
        self.assertEqual(len(buttons), 1)
        self.assertEqual(buttons[0]["text"].strip(), "Enviar")
        self.assertIn("disabled", buttons[0]["attrs"])
        self.assertEqual(buttons[0]["attrs"].get("type"), "button")
        for node in [self.section] + self.nodes:
            self.assertNotIn(node["tag"], {"form", "script", "a", "iframe"})
            for attr in node["attrs"]:
                self.assertFalse(attr.startswith("on"))
                self.assertNotIn(attr, {"action", "formaction", "form", "src", "href"})

    def test_position_and_local_styles(self):
        previous = [n for n in self.doc.nodes[:self.doc.nodes.index(self.section)]
                    if n["tag"] == "div" and
                    "section-portafolio" in n["attrs"].get("class", "").split()]
        self.assertIn("Conocimientos", previous[-1]["text"])
        styles = [n["attrs"].get("href") for n in self.doc.nodes
                  if n["tag"] == "link" and n["attrs"].get("rel") == "stylesheet"]
        self.assertEqual(styles[:2], ["css/all.css", "css/Page.css"])
        for style in styles[:2]:
            self.assertTrue((ROOT / style).is_file())


if __name__ == "__main__":
    unittest.main()
