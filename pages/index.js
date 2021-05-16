import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Frame, Page, Layout, Card, FormLayout, Checkbox, TextField, Tabs, Toast, PageActions, Stack, Collapsible, TextContainer, Link, Button, Heading } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import axios from "axios";

const Index = () => {
  const app = useAppBridge();
  const router = useRouter();
  const shop = router.query.shop || "";

  const [saving, setSaving] = useState(false);

  const [toastActive, setToastActive] = useState(false);
  const toggleToastActive = useCallback(() => setToastActive((active) => !active), []);
  const toastMarkup = toastActive ? (
    <Toast content="Saved Successfully" onDismiss={toggleToastActive} />
  ) : null;

  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  const [enable, setEnable] = useState(true)

  const [priceSuffix, setPriceSuffix] = useState('')

  const [quantitySuffix, setQuantitySuffix] = useState('')

  const [minError, setMinError] = useState('')
  const [min, setMin] = useState(0);

  const [maxError, setMaxError] = useState('')
  const [max, setMax] = useState(0);

  const [step, setStep] = useState('1')
  const [stepError, setStepError] = useState('')

  const [defaultQty, setDefaultQty] = useState('1')
  const [defaultQtyError, setDefaultQtyError] = useState('')

  const handleChangeEnable = useCallback(value => setEnable(value), [])

  const handleChangePriceSuffix = useCallback(value => setPriceSuffix(value), [])

  const handleChangeQuantitySuffix = useCallback(value => setQuantitySuffix(value), [])

  const handleChangeMin = useCallback(value => {
    setMin(value)
    formValidate(value, max, step, defaultQty)
  }, [min, max, step, defaultQty]);

  const handleChangeMax = useCallback(value => {
    setMax(value)

    formValidate(min, value, step, defaultQty)
  }, [min, max, step, defaultQty]);

  const handleChangeStep = useCallback(value => {
    setStep(value)

    formValidate(min, max, value, defaultQty)
  }, [min, max, step, defaultQty])

  const handleChangeDefaultQty = useCallback(value => {
    setDefaultQty(value)

    formValidate(min, max, step, value)
  }, [min, max, step, defaultQty]);

  const getConfig = async () => {
    let sessionToken = await getSessionToken(app);

    let data = {
      shop,
    };

    let res = await axios.post("/api/get_config", data, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    let config = res.data.config;

    if (config) {
      setMin(config.min)
      setMax(config.max)
      setStep(config.step)
      setDefaultQty(config.defaultQty)
    }
  };

  const formValidate = (min, max, step, defaultQty) => {
    setMinError('')
    setMaxError('')
    setStepError('')
    setDefaultQtyError('')

    if (!min) {
      setMinError('Minimum Quantity is required')
    } else if (parseInt(min) <= 0) {
      setMinError('Minimum Quantity must greater than 0')
    }

    if (!max) {
      setMaxError('Maximum Quantity is required')
    } else if (parseInt(max) <= 0) {
      setMaxError('Maximum Quantity must greater than 0')
    }

    if (min && parseInt(min) > 0 && max && parseInt(max) > 0 && parseInt(min) >= parseInt(max)) {
      setMinError('Minimum Quantity must smaller than Maximum Quantity')
      setMaxError('Maximum Quantity must greater than Minimum Quantity')
    }

    if (!step) {
      setStepError('Step is required')
    } else if (parseInt(step) <= 0) {
      setStepError('Step must greater than 0')
    }

    if (!defaultQty) {
      setDefaultQtyError('Default Quantity is required')
    } else if (parseInt(defaultQty) <= 0) {
      setDefaultQtyError('Default Quantity must greater than 0')
    } else if (parseInt(min) > 0 && parseInt(max) > 0 && (parseInt(defaultQty) < parseInt(min) || parseInt(defaultQty) > parseInt(max))) {
      setDefaultQtyError('Default Quantity must >= Minimum Quantity and <= Maximum Quantity')
    }
  }

  useEffect(() => {
    // getConfig()
  }, []);

  const saveConfig = async () => {
    formValidate(min, max, step, defaultQty)

    if (minError || maxError || stepError || defaultQtyError) {
      return
    }

    let data = {
      shop,
      config: {
        enable,
        min,
        max,
        step,
        defaultQty
      }
    };

    let sessionToken = await getSessionToken(app);

    setSaving(true);

    try {
      await axios.post("/api/save_config", data, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      toggleToastActive();
      setSaving(false);
    } catch (error) {
      toggleToastActive();
      setSaving(false);
    }
  };

  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: 'settings',
      content: "Settings"
    },
    {
      id: 'installation',
      content: 'Installation',
    }
  ];

  return (
    <Frame>
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <Card.Section title="Settings">
                <FormLayout>
                  <Checkbox
                    label="Enable Quantity Button"
                    checked={enable}
                    onChange={handleChangeEnable}
                  />
                  <FormLayout.Group>
                    <TextField
                      label="Price Suffix"
                      type="text"
                      value={priceSuffix}
                      onChange={handleChangePriceSuffix}
                    />
                    <TextField
                      label="Quantity Suffix"
                      type="text"
                      value={quantitySuffix}
                      onChange={handleChangeQuantitySuffix}
                    />
                  </FormLayout.Group>
                  <FormLayout.Group>
                    <TextField
                      label="Step"
                      inputMode="decimal"
                      onChange={handleChangeStep}
                      value={step}
                    />
                  </FormLayout.Group>
                  <Button disabled={saving} onClick={saveConfig} primary>Save</Button>
                </FormLayout>
              </Card.Section>
              <Card.Section title="Exclude">
                
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
        {toastMarkup}
      </Page>
    </Frame>
  )
}

export default Index;