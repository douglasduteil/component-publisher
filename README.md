# component-publisher

A node stuff to publish components on github and bower

## Usage

To work you must at less have this file tree:
```
+
  - bower.json
  + demo
    - // file used in your demo page
  + src
    - // your source files here
  + gh-pages (doc) branch
  + bower (build) branch // build directory is committed
    - tag: v1.0.x
    - tag: v1.1.x
  + bower-subcomponent (like angular-ui-event) branch
    - tag: ui-event-1.0.x
    - tag: ui-event-1.1.x
```

## Goal

```
+ git repo
  + master (src) branch // build directory is ignored
    - tag: src1.0.x
    - tag: src1.1.x
  + gh-pages (doc) branch
  + bower (build) branch // build directory is committed
    - tag: v1.0.x
    - tag: v1.1.x
  + bower-subcomponent (like angular-ui-event) branch
    - tag: ui-event-1.0.x
    - tag: ui-event-1.1.x
```
