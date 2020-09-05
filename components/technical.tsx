import { PropsWithChildren, useState } from 'react'

let timeoutHandle: ReturnType<typeof setTimeout> | null

function CopyOnClick({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <style jsx>{`
        .mono {
          font-family: monospace;
          word-wrap: break-word;
          max-width: 800px;
          white-space: pre-line;
          max-height: 143px;
          overflow-y: hidden;
          word-break: break-all;
        }
      `}</style>
      <div
        className="mono"
        onClick={(event) => {
          const selection = window.getSelection()
          if (!selection) return
          selection.selectAllChildren(event.currentTarget)
          document.execCommand('copy')
          document.querySelector('.copied')?.classList.remove('nonvisible')
          if (timeoutHandle) clearTimeout(timeoutHandle)
          timeoutHandle = setTimeout(function () {
            document.querySelector('.copied')?.classList.add('nonvisible')
            timeoutHandle = null
          }, 2500)
        }}
      >
        {children}
      </div>
    </>
  )
}

export function Technical() {
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible((v) => !v)
  return (
    <>
      <style jsx>{`
        .nonvisible {
          visibility: hidden;
        }
      `}</style>
      <button className="technical" onClick={toggle}>
        Technical stuff
      </button>
      <div className="technical" style={visible ? {} : { display: 'none' }}>
        <h2>Desktop SSH key</h2>
        <CopyOnClick>{`ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAEAQDAyefs+TDyduI7SECWwgBLGRYT+G6LEQZjbzJjI0Fkp4350WJjBg6EfRSDevDr4/scQBPW0ElbMiHOG6GskhfCVLkCjnJfxplYIsTcSgYyuaQcBJitbcHO0g8J0Nf4/dPVm3PyTXeukcZ8f5Odnf+Ipi2W+WH4iBuFF63Fieq3Uo+xKASEcReZy3XCiBfgIwgv7ratqut0XNZQ9QMp//y+0a4s4y3tF/nNOPl3XkqYT/O2+cSaPYgp2W2V+0qwVMNef5BVRhzFMMAo4RO6Q4/vFaI7hQ/P47JLfxqulk/Ppb9gBNPmjXoxZHGOfE8VpdEBVNLcKmFl3q1OHbM0urifgB1Xp3rKETxbtJuIZW5xLFMEnblTliB/hsX1GwJ7risV497uNaamV2Lan+0nkb32tA9o+f/7vDGBd9TfqZjRS10HZLwPc9ylyAHXB018TCow9YGsDbXydkSnpwbEkKLE7mLj4HZyOsmGSanlUzT8xD3vIX9bqZP9sqT2c2BER/68vqSe/PMB0wihFdmTEa2DWyqfVyfavj7+rpRq8Cr8N+yozZtbkOfL5pMXPrt/rNZHSD6wtuO8gwG6Vmg3HwP0H5pEMQhUj65piU2CR2gNc7TWaCWPpm3LDq3gfqPciuj0ORc03HOu3RUBTRNtF27ZC7z3yUFdsv/n/Fwvsbw0MZLrAxnPFBWBhLxIEI7jbaJHkr33tDh3paLi5lPMldMiGfqqWE4t5Hl0d5LAO4FKOEH9CPWBx5xtA/mmHrDXtuaBQ15L++Ugs/C2rEQ4LE3utVWjHQKmDx4Fq0rbU8MQfYUVeYTtiCz1oDo/49NEy8y51yyOiEG2hii8ZFRyQczME/sJWrY91VCsecg+vQfr1BerI+PWgHWMfAydEY/J0bQE/TLDi9yDBTAlvRqxpzz2/Vpaq7/bVuf9M2hXu0H1r06KdjD/qF7djoakc92WaZTNjloZ0bmlVSosgbetgiYeTk6tD7gVN7ew1LT5H9YKYXiOLfo1JF2yvx0XsCjJsOeh5h5XzjGk9a1YdggoLTlKIhF/pHK9BJuGfg13DB6sVT8ZK9rr69FjuGvQrmogqRD86Vv8+tmT0vFskO4yHpc3ylwJWOWYSZlsjw8V7egQ7oNTDRx5lofKtIdJp33jFeeqzuiPlfPeshFy6Dd0W18YO+pNawlxs57WmMY9UK0Rc52/C/jXedMAnYnUNDeaTZDXoIVGyu0C7Yn1dLKXT3vZJ8og4zjARs2WuIcdKsH5/lrrCLngMttaVpdCxlurkRxt6ibfF/SgLIahYulD3yTawmRpjK6ttbUoKbP7cU1uFnPODLPU7zzEpktUaHPtT4/Uv4lZTVzP2HvV/oIH0uE/ isabella@desktop.skorepova.info`}</CopyOnClick>
        <h2>GPG key</h2>
        <CopyOnClick>{gpg}</CopyOnClick>
        <h2>Notebook GPG key</h2>
        <CopyOnClick>{ntbGpg}</CopyOnClick>
        <h2>Mobile SSH key</h2>
        <CopyOnClick>{`ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC5NK1BZtumG4+huAH3K6T8L3UeWyVe2+71VZWcuop/6zj5m9wP2AqdJ8H0BVUPJWawOIYBtyBizg6+vCOZ/H7DGi+KmyxhNqUWyXuTjHhiCMZP1ilB0n7EiQOI/6LK9F6xC6U5MyWPVTMyYAg4rjuK+8vNLlPVlx0ezsDrqTNUQaNDxjaExj4nUHsKg334gZ8QwnTSrXGw+2Wx2NsxE0HTMUygyuz2CH84fPfZBE4d2wnUPlWC/lxk6HBvBiRDArGay53Fo/M8ihRbB50kn1arPkkJQnGP+ZQf82phTxiMPjOmwZj+QxjnR9WbEmNa28qoUibeYmUaYYYmIs6iMz2eUZnU+zJyhm2ShCpYn76w/hKxZZ1nd+7oSWMVZs9cgHX2pmMmmg+8Tc4f5RefhxXjfYPtaXKQaqK+sN5VeKk+AqTnAoBwFARjNEjVbMcc1ZTB79h0GzhQlyRai9Z2I4fET0uoBhl2R7wjsADN9k6abxTpZG7+g29aMCfZpz+SRTH4WDUCCtel7pZNbAGnfhL6/9NfsrklSt9p+9LrV+9eZovwoCFV4gt+A4KPLFuHJi6CVgjG5VBADOWxB5EstoQvBhccoJBUcVPju+aGUDm4MApnSmRDLilLKXYiYZW4aHnB3DAiiyEqLUG/rzuCICugm6Rn5z1YV+7VjR+uQpRO4Q== isabella@xiaomi-mi-a1`}</CopyOnClick>
        <h2>Notebook SSH key</h2>
        <CopyOnClick>{`ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDFDcrPFUXJT5IdBPJajZggzpEWEX4eeSrGNY3DDMc9b+y/bA3vRflMWph07HxPURMG3NNdro6md3Ra53Sk4EBHst7ziEVmbIyLGuNXm273bpKoLRmW+HSf4s/q/6VNtCTt1ddgyL8s6IM9ndHr4VCis3msQuTyHCZMp9Ktfao38DNIMdOIOm3wRsOy7oyYWUbabmxK7HTnAiK4YljpSPAgQRyEz9+h04QHH991NSwq9IKELKwOlQ7czSwxbmR4yc00Zame2d8gZ502e1Q3OYoijTLwXZSApibMif4VASmylktu/uTxvm9jHZJu54Vv8L2K5vOY7Lyk/GYIfdoAU2lP isabella@ntb.skorepova.info`}</CopyOnClick>
        <h2>MacBook Pro 2019 SSH key</h2>
        <CopyOnClick>{`ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDWlvC/C5vT3BksVmC4c2ua0+D+2VoNvcXzuOLjFrlgKlr2xsP34GsawBkz4n1aDT3u4t4MBTEXFVF95JYJkGyEv/190LpiDFBICiOOLlekssc+HxDfY27eOM4begRUoIXqE6IvZtbbH0w5q8J32IPIIatPWnIYovhwH7jaoPNpBSFRIuj4sIMe5NU6bTyCjK/hNiOLe2HpshI9IX8V8TiUs3mpegzf4Ls/zE+CewyZx82QSKr2lyVNpRsck+4Z9KJGg3L6WN2O44Lgqy+Apmu0fRBgyD2uKwPqdNuEI4Ci0vr3azVX/WwogQTBBEOXV3jYLzXPeZJ+3YSBbhXqeuhh isabella@Isabellas-MacBook-Pro.local`}</CopyOnClick>
      </div>
      <div
        className="copied nonvisible"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'black',
            color: 'white',
            fontSize: '3vw',
            padding: '3vw',
            borderRadius: '3vw',
          }}
        >
          Zkopírováno!
        </div>
      </div>
    </>
  )
}

const gpg = `
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
zxPWvWZxNza3BQ==
=q+aS
-----END PGP PUBLIC KEY BLOCK-----
`.trim()

const ntbGpg = `
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
xe6jvnOCdfyAsVWF8DuaIQ==
=Ws/U
-----END PGP PUBLIC KEY BLOCK-----
`.trim()
