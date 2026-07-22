import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useLanguage } from '../translations';

const CONTACT_EMAIL = "encomendas@mbravobycarolina.com";

interface LegalModalProps {
    type: 'envios' | 'privacidade' | 'termos';
    onClose: () => void;
}

const LegalModal = ({ type, onClose }: LegalModalProps) => {
    const { lang } = useLanguage();
    
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        (window as any).lenis?.stop();
        return () => {
            document.body.style.overflow = '';
            (window as any).lenis?.start();
        };
    }, []);

    const ptContent = {
        envios: {
            title: "Política de Envios e Devoluções",
            body: (
                <div className="space-y-8 text-forest">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Envios e Prazos de Entrega
                        </h3>
                        <p className="font-serif italic text-base text-forest/95 mb-6 leading-relaxed">
                            Na M★BRAVO, cada peça é meticulosamente desenvolvida à mão, respeitando o tempo do artesanato de luxo.
                        </p>
                        <ul className="space-y-4 text-forest/75 text-sm font-sans font-light">
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Prazo de Produção</strong>
                                <span>O tempo estimado para a produção e preparação de cada peça varia entre 4 a 7 dias úteis após a confirmação do pagamento.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Método de Envio</strong>
                                <span>Todos os envios são realizados através de transportadora registada. Assim que a sua encomenda for expedida, receberá um e-mail com o respetivo código de rastreamento (tracking number) para acompanhar a entrega.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Custos de Envio</strong>
                                <span>Os custos de transporte são calculados de forma automática no momento do checkout, variando consoante o destino e a distância da entrega.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-forest/10">
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Política de Devoluções
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            Por se tratarem de artigos de design autoral, confecionados artesanalmente sob encomenda, a M★BRAVO apenas aceita devoluções ou trocas em caso de defeito de fabrico comprovado.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            Se detetar algum defeito na sua peça, deverá contactar-nos no prazo máximo de 14 dias após a receção, através do e-mail <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-medium font-mono">{CONTACT_EMAIL}</a>, enviando fotografias detalhadas do problema.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed">
                            Após a validação da nossa equipa, procederemos à recolha do artigo e ao respetivo reembolso ou substituição da peça, sem qualquer custo adicional para o cliente.
                        </p>
                    </div>
                </div>
            )
        },
        privacidade: {
            title: "Política de Privacidade",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        A proteção da privacidade dos nossos clientes é um pilar fundamental da M★BRAVO. Esta política descreve como recolhemos, utilizamos e salvaguardamos a sua informação pessoal.
                    </p>

                    <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Recolha e Utilização de Dados
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            Os dados pessoais recolhidos durante o processo de compra (nome, endereço de e-mail, número de telefone e morada de entrega) são estritamente necessários e utilizados exclusivamente para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-forest/75 text-sm font-sans font-light ml-2">
                            <span>Processamento, produção e envio da sua encomenda;</span>
                            <span>Comunicação de atualizações sobre o estado da compra e código de rastreamento;</span>
                            <span>Apoio ao cliente e esclarecimento de dúvidas.</span>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-forest/10">
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Partilha e Proteção de Dados
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            A M★BRAVO não vende, aluga ou partilha os seus dados pessoais com terceiros para fins de marketing. Os seus dados são transmitidos unicamente às empresas de transporte para efeitos de entrega da encomenda.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed">
                            Todos os dados de contacto e histórico de compras permanecem protegidos sob medidas técnicas e organizativas rigorosas.
                        </p>
                    </div>
                </div>
            )
        },
        termos: {
            title: "Termos e Condições de Uso",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        Bem-vindo à M★BRAVO. Ao navegar no nosso site ou efetuar uma encomenda, concorda com os seguintes termos e condições de utilização.
                    </p>

                    <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Autenticidade e Especificidades Artesanais
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            Todas as nossas peças são confecionadas 100% à mão através de técnicas tradicionais de crochet de luxo. Devido à natureza artesanal de cada criação, podem ocorrer pequenas variações impercetíveis na textura do fio ou nas dimensões exatas, o que confere a cada peça a sua identidade única e autêntica.
                        </p>
                    </div>

                    <div className="pt-6 border-t border-forest/10">
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Propriedade Intelectual e Autoral
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed">
                            Todo o conteúdo presente neste site — incluindo fotografias, designs de produto, textos, logótipos e imagens de marca — é propriedade exclusiva de Carolina Bravo / M★BRAVO. É expressamente proibida a reprodução, cópia ou utilização não autorizada de qualquer elemento sem o nosso consentimento prévio por escrito.
                        </p>
                    </div>
                </div>
            )
        }
    };

    const enContent = {
        envios: {
            title: "Shipping & Returns Policy",
            body: (
                <div className="space-y-8 text-forest">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Shipping & Delivery Times
                        </h3>
                        <p className="font-serif italic text-base text-forest/95 mb-6 leading-relaxed">
                            At M★BRAVO, each piece is meticulously handcrafted, honoring the cadence of slow luxury craftsmanship.
                        </p>
                        <ul className="space-y-4 text-forest/75 text-sm font-sans font-light">
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Production Lead Time</strong>
                                <span>The estimated time for creation and preparation ranges between 4 to 7 business days following payment confirmation.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Shipping Method</strong>
                                <span>All orders are shipped via registered courier. Once dispatched, you will receive an email with your tracking number.</span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <strong className="font-medium text-forest text-xs uppercase tracking-wider">Shipping Fees</strong>
                                <span>Shipping costs are automatically calculated at checkout based on destination and delivery region.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-forest/10">
                        <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] mb-4 font-sans">
                            Returns Policy
                        </h3>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            As bespoke items crafted by hand upon request, M★BRAVO accepts returns or exchanges strictly in the case of proven manufacturing defects.
                        </p>
                        <p className="text-forest/75 text-sm font-sans font-light leading-relaxed mb-4">
                            If you notice a flaw upon arrival, please contact us within 14 days at <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-forest transition-colors font-medium font-mono">{CONTACT_EMAIL}</a> with detailed pictures.
                        </p>
                    </div>
                </div>
            )
        },
        privacidade: {
            title: "Privacy Policy",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        Protecting customer privacy is a core principle at M★BRAVO.
                    </p>
                    <p className="text-forest/75 text-sm font-sans font-light leading-relaxed">
                        Personal data collected during checkout is used exclusively for order fulfillment, delivery tracking, and direct customer support.
                    </p>
                </div>
            )
        },
        termos: {
            title: "Terms & Conditions",
            body: (
                <div className="space-y-8 text-forest">
                    <p className="font-serif italic text-base text-forest/95 leading-relaxed">
                        Welcome to M★BRAVO. By using our platform, you agree to our terms of craft authenticity and intellectual property rights.
                    </p>
                </div>
            )
        }
    };

    const current = (lang === 'pt' ? ptContent : enContent)[type];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-forest/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl w-full bg-[#FCFBF9] text-forest rounded-xl xs:rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_24px_50px_rgba(31,42,24,0.15)] flex flex-col max-h-[85vh] border border-forest/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 md:px-8 py-5 border-b border-forest/10 flex justify-between items-center bg-[#FCFBF9]">
                    <h2 className="text-sm md:text-base font-serif uppercase tracking-[0.2em] font-medium text-forest">
                        {current.title}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center transition-colors text-forest/70 hover:text-forest cursor-pointer"
                        aria-label={lang === 'pt' ? 'Fechar' : 'Close'}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div data-lenis-prevent className="px-6 md:px-10 py-6 md:py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-forest/10">
                    {current.body}
                </div>

                {/* Footer */}
                <div className="px-6 md:px-8 py-4 border-t border-forest/5 bg-forest/[0.02] flex justify-between items-center text-[10px] text-forest/40">
                    <span className="font-mono">M★BRAVO ATELIER</span>
                    <button 
                        onClick={onClose}
                        className="uppercase tracking-[0.15em] font-medium text-forest/65 hover:text-forest transition-colors cursor-pointer"
                    >
                        {lang === 'pt' ? 'Fechar' : 'Close'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LegalModal;
