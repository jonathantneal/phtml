# Changes to pHTML

### 2.0.0 (February 17, 2019)

- Added: Browser version
- Added: CLI version
- Added: Plugins now allow observers
- Added: `Fragment` can now take nodes
- Added: `#Result.messages` to contain warnings and other types of messages
- Changed: Parser is now smaller, synchronous, and can be run in the browser
- Changed: `Result` returns the `root` fragment syncronously
- Changed: Raw HTML spacing is added and used to stringify tags and attributes
- Changed: Tag case-sensitivity is preserved
- Changed: `source.input` is now an Object containing `html`, `from,` and `to`

### 1.2.0 (February 13, 2019)

- Added: `NodeList.from()` creates a NodeList from an array or Nodes and Strings
- Added: `Node.prepend()` to prepend items to a Node parent
- Fixed: `AttributeList.from()` to correctly parse attribute-like values
- Fixed: Issue with `new Element()` not correctly creating or moving nodes

### 1.1.6 (February 12, 2019)

- Fixed: Issue walking nodes as they change

### 1.1.5 (February 12, 2019)

- Fixed: Issue with null settings and linked attributes during cloning

### 1.1.4 (February 11, 2019)

- Fixed: Issue with empty Attributes not returning null

### 1.1.3 (February 10, 2019)

- Fixed: Issue with Plugins not being executable

### 1.1.2 (February 10, 2019)

- Fixed: Issue with resolving the parser
- Fixed: Issue with potentially generated empty text nodes around JSX

### 1.1.1 (February 10, 2019)

- Fixed: Issue with closing JSX partials breaking the parser

### 1.1.0 (February 10, 2019)

- Added: Nodes return `type` String
- Added: Nodes contain `warn` Function
- Added: Results contain `currentPlugin` property
- Added: Plugins get second `result` argument

### 1.0.0 (February 10, 2019)

- Initial version
