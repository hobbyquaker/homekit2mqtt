For problems with a specific Accessory please include relevant log lines (start with `-v debug`) and the Accessories configuration like in following Example:

```
2017-07-30 09:59:17.746 <debug> < mqtt Switch/status 1
2017-07-30 09:59:17.746 <debug> > hap set Steckdose Fernseher Switch true
```

```
  "Switch": {
    "service": "Switch",
    "name": "Steckdose Fernseher",
    "topic": {
      "statusOn": "Switch/status",
      "setOn": "Switch/set"
    },
    "payload": {
      "onTrue": 1,
      "onFalse": 0
    },
    "manufacturer": "Generic",
    "model": "Switch"
  },
```
