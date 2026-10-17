# Evoluzn FX-ID5L: OpenWrt 25.12.5 RAM-boot build kit

**This kit does NOT contain a finished bootable `.bin`.** It contains an OpenWrt build script and a vetted set of files to integrate.

The uploaded `test-16mb-fixed.bin` is a legacy U-Boot MIPS image with an LZMA-compressed kernel 6.12.94 and embedded initramfs. The current-system archive has 155 packages versus 140 in the base initramfs: 15 packages must be added by a new build (USB drivers, socat, picocom, dependencies). The archive does not contain those installed binaries.

### Build on Windows via WSL2 Ubuntu

1. Put this extracted kit under your Ubuntu home directory (e.g. `~/fxid5l-kit`), not under `/mnt/c`.
2. Provide at least 20–30 GB of free disk space. Compilation may take hours.
3. Install prerequisites:

```sh
sudo apt-get update
sudo apt-get install -y build-essential clang flex bison g++ gawk gettext git \
 libncurses-dev libssl-dev python3 python3-setuptools rsync unzip zlib1g-dev \
 file curl wget ca-certificates subversion patch pkgconf libelf-dev
```

4. Run `JOBS=2 bash build_ram.sh` from the extracted kit directory.
5. If successful, the new RAM-boot `.bin` will appear under `~/openwrt-fxid5l-ram-build/bin/targets/ramips/mt76x8/`.

### Contents and boundaries

- Includes the LTE Band Manager web page and status/control RPC code from your archive.
- Includes USB ACM/RNDIS drivers, `socat`, and `picocom` in the requested build configuration.
- Includes identity status/validation page only, not an arbitrary cellular IMEI record-deletion or programming endpoint.
- Restores previously observed LAN IP `192.168.0.1` and VLAN member ports for RAM boot.
- The original archived `/etc/shadow`, host keys, credentials, and full configuration remain in YOUR verified backup, but are intentionally not bundled into this kit.
- This still builds against the **ZBT-WE1226 reference device tree**, because the actual FX-ID5L device tree and OEM flash partition layout are not verified. It may show the wrong model in LuCI.
- **NOT for permanent flash or sysupgrade.** Only test from RAM using serial console + TFTP. Do not write this image to either OEM flash slot.
- Set a root password on the test router before connecting it to an untrusted network.

Source: https://github.com/openwrt/openwrt/tree/v25.12.5
Build instructions: https://openwrt.org/docs/guide-developer/toolchain/use-buildsystem

### Provenance

- Input kernel SHA-256: `1e562c7166e06d6c6350bdf345d549fba7e5617d4113f1403b260aba5ac97802`
- Current system archive SHA-256: `f550654806ffdc9476407b150357c9c32fb33e72af9670c188b4d99ef6692eff`
